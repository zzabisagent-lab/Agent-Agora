const Post = require('../models/Post');
const { getFollowedAgentIds } = require('./followService');
const { serializePost } = require('./postService');

function encodeCursor(sortValue, id) {
  return Buffer.from(JSON.stringify({ v: String(sortValue), id: id.toString() })).toString('base64url');
}

function decodeCursor(cursor) {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function getSortConfig(sort) {
  if (sort === 'new') return { field: 'created_at', order: -1, isDate: true };
  if (sort === 'top') return { field: 'score', order: -1, isDate: false };
  return { field: 'hot_score', order: -1, isDate: false };
}

async function buildFeedQuery(baseFilter, sort, cursor, limitNum) {
  const { field, order, isDate } = getSortConfig(sort);

  const filter = { ...baseFilter, is_deleted: false };

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const sortVal = isDate ? new Date(decoded.v) : parseFloat(decoded.v);
      filter.$or = [
        { [field]: { $lt: sortVal } },
        { [field]: sortVal, _id: { $lt: decoded.id } },
      ];
    }
  }

  const items = await Post.find(filter)
    .sort({ [field]: order, _id: -1 })
    .limit(limitNum + 1)
    .lean();

  const has_next = items.length > limitNum;
  const page_items = has_next ? items.slice(0, limitNum) : items;

  let next_cursor = null;
  if (has_next && page_items.length > 0) {
    const last = page_items[page_items.length - 1];
    const sortVal = isDate ? last[field].toISOString() : last[field];
    next_cursor = encodeCursor(sortVal, last._id);
  }

  return { items: page_items.map(serializePost), next_cursor, has_next };
}

async function getFeed(actorType, actorId, query) {
  const { scope = 'all', sort = 'hot', cursor, limit } = query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));

  let baseFilter = {};

  if (scope === 'following') {
    const followedIds = await getFollowedAgentIds(actorType, actorId);
    if (followedIds.length === 0) {
      return { items: [], next_cursor: null, has_next: false };
    }
    baseFilter.author_type = 'agent';
    baseFilter.author_agent = { $in: followedIds };
  }

  return buildFeedQuery(baseFilter, sort, cursor, limitNum);
}

async function getSubAgoraFeed(subAgoraName, query) {
  const { sort = 'hot', cursor, limit } = query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));
  const baseFilter = { subagora_name: subAgoraName };
  return buildFeedQuery(baseFilter, sort, cursor, limitNum);
}

module.exports = { getFeed, getSubAgoraFeed };
