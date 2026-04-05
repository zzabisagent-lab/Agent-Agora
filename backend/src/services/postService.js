const Post = require('../models/Post');
const SubAgora = require('../models/SubAgora');
const { calcHotScore } = require('../utils/hotScore');

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

function serializePost(p) {
  return {
    _id: p._id,
    title: p.title,
    content: p.content || null,
    url: p.url || null,
    type: p.type,
    subagora: p.subagora,
    subagora_name: p.subagora_name,
    author_type: p.author_type,
    author_name: p.author_name,
    upvotes: p.upvotes,
    downvotes: p.downvotes,
    score: p.score,
    hot_score: p.hot_score,
    comment_count: p.comment_count,
    is_deleted: p.is_deleted,
    is_pinned: p.is_pinned,
    verification_status: p.verification_status,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

async function createPost(actorType, actorId, actorName, body) {
  const { title, content, url, type, subagora_name } = body;

  const subAgora = await SubAgora.findOne({ name: subagora_name });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const authorField = actorType === 'human' ? 'author_human' : 'author_agent';
  const now = new Date();

  const postData = {
    title,
    type,
    subagora: subAgora._id,
    subagora_name,
    author_type: actorType,
    [authorField]: actorId,
    author_name: actorName,
    ...(content !== undefined && { content }),
    ...(url !== undefined && { url }),
  };

  const post = new Post(postData);
  post.hot_score = calcHotScore(0, now);
  await post.save();

  await SubAgora.findByIdAndUpdate(subAgora._id, { $inc: { posts_count: 1 } });

  return { success: true, post };
}

async function listPosts(query) {
  const { subagora_name, author_type, author_name, sort = 'hot', cursor, limit } = query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));

  const filter = { is_deleted: false };
  if (subagora_name) filter.subagora_name = subagora_name;
  if (author_type) filter.author_type = author_type;
  if (author_name) filter.author_name = { $regex: author_name, $options: 'i' };

  let sortField;
  let sortOrder = -1;

  if (sort === 'new') {
    sortField = 'created_at';
  } else if (sort === 'top') {
    sortField = 'score';
  } else {
    sortField = 'hot_score';
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const sortVal = sort === 'new' ? new Date(decoded.v) : parseFloat(decoded.v);
      filter.$or = [
        { [sortField]: { $lt: sortVal } },
        { [sortField]: sortVal, _id: { $lt: decoded.id } },
      ];
    }
  }

  const items = await Post.find(filter)
    .sort({ [sortField]: sortOrder, _id: -1 })
    .limit(limitNum + 1)
    .lean();

  const has_next = items.length > limitNum;
  const page_items = has_next ? items.slice(0, limitNum) : items;

  let next_cursor = null;
  if (has_next && page_items.length > 0) {
    const last = page_items[page_items.length - 1];
    const sortVal = sort === 'new' ? last[sortField].toISOString() : last[sortField];
    next_cursor = encodeCursor(sortVal, last._id);
  }

  return {
    items: page_items.map(serializePost),
    next_cursor,
    has_next,
  };
}

async function getPost(postId) {
  const post = await Post.findById(postId).lean();
  if (!post) return null;
  if (post.is_deleted) return { ...serializePost(post), _deleted: true };
  return serializePost(post);
}

async function deletePost(postId, actorType, actorId) {
  const post = await Post.findById(postId);
  if (!post || post.is_deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Check: author or moderator of the subagora
  const isAuthor = post.author_type === actorType &&
    (actorType === 'human'
      ? post.author_human && post.author_human.toString() === actorId.toString()
      : post.author_agent && post.author_agent.toString() === actorId.toString()
    );

  if (!isAuthor) {
    // Check moderator
    const subAgora = await SubAgora.findById(post.subagora).lean();
    if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

    const field = actorType === 'human' ? 'user_human' : 'user_agent';
    const isMod = subAgora.moderators.some(
      (m) => m[field] && m[field].toString() === actorId.toString()
    );
    if (!isMod) return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  post.is_deleted = true;
  post.deleted_at = new Date();
  await post.save();

  await SubAgora.findByIdAndUpdate(post.subagora, { $inc: { posts_count: -1 } });

  return { success: true };
}

async function pinPost(postId, subAgoraName) {
  const post = await Post.findById(postId);
  if (!post || post.is_deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };
  if (post.subagora_name !== subAgoraName) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const subAgora = await SubAgora.findById(post.subagora);
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  if (subAgora.pinned_posts.length >= 3) {
    return { success: false, code: 'PIN_LIMIT_EXCEEDED', status: 409 };
  }

  if (!subAgora.pinned_posts.some((id) => id.toString() === postId.toString())) {
    subAgora.pinned_posts.push(post._id);
    await subAgora.save();
  }

  post.is_pinned = true;
  await post.save();

  return { success: true, post };
}

async function unpinPost(postId, subAgoraName) {
  const post = await Post.findById(postId);
  if (!post || post.is_deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };
  if (post.subagora_name !== subAgoraName) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const subAgora = await SubAgora.findById(post.subagora);
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const idx = subAgora.pinned_posts.findIndex((id) => id.toString() === postId.toString());
  if (idx >= 0) {
    subAgora.pinned_posts.splice(idx, 1);
    await subAgora.save();
  }

  post.is_pinned = false;
  await post.save();

  return { success: true, post };
}

module.exports = { createPost, listPosts, getPost, deletePost, pinPost, unpinPost, serializePost };
