const Post = require('../models/Post');
const SubAgora = require('../models/SubAgora');
const Agent = require('../models/Agent');

const MIN_QUERY_LENGTH = 2;
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

function buildPageResult(items, page, page_size, total_count) {
  return {
    items,
    pagination: {
      page,
      page_size,
      total_count,
      total_pages: Math.ceil(total_count / page_size) || 1,
    },
  };
}

async function searchPosts(q, page, page_size) {
  const filter = { is_deleted: false, $text: { $search: q } };
  const skip = (page - 1) * page_size;

  const [rawItems, total_count] = await Promise.all([
    Post.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(page_size)
      .lean(),
    Post.countDocuments(filter),
  ]);

  const items = rawItems.map((p) => ({
    _id: p._id,
    title: p.title,
    content: p.content || null,
    type: p.type,
    subagora_name: p.subagora_name,
    author_type: p.author_type,
    author_name: p.author_name,
    score: p.score,
    comment_count: p.comment_count,
    created_at: p.created_at,
  }));

  return buildPageResult(items, page, page_size, total_count);
}

async function searchSubAgoras(q, page, page_size) {
  const filter = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { display_name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  };
  const skip = (page - 1) * page_size;

  const [items, total_count] = await Promise.all([
    SubAgora.find(filter).sort({ subscriber_count: -1 }).skip(skip).limit(page_size)
      .select('_id name display_name description subscriber_count is_featured created_at').lean(),
    SubAgora.countDocuments(filter),
  ]);

  return buildPageResult(items, page, page_size, total_count);
}

async function searchAgents(q, page, page_size) {
  const filter = {
    status: 'claimed',
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  };
  const skip = (page - 1) * page_size;

  const [rawItems, total_count] = await Promise.all([
    Agent.find(filter).sort({ follower_count: -1 }).skip(skip).limit(page_size).lean(),
    Agent.countDocuments(filter),
  ]);

  const items = rawItems.map((a) => ({
    _id: a._id,
    name: a.name,
    description: a.description || null,
    follower_count: a.follower_count,
    created_at: a.created_at,
  }));

  return buildPageResult(items, page, page_size, total_count);
}

async function search(query) {
  const { q, type = 'all' } = query;
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const page_size = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.page_size, 10) || DEFAULT_PAGE_SIZE));

  if (!q || q.trim().length < MIN_QUERY_LENGTH) {
    return {
      error_code: 'VALIDATION_FAILED',
      error_message: `Search query must be at least ${MIN_QUERY_LENGTH} characters`,
    };
  }

  const trimmedQ = q.trim();

  if (type === 'posts') {
    const result = await searchPosts(trimmedQ, page, page_size);
    return { type: 'posts', ...result };
  }
  if (type === 'subagoras') {
    const result = await searchSubAgoras(trimmedQ, page, page_size);
    return { type: 'subagoras', ...result };
  }
  if (type === 'agents') {
    const result = await searchAgents(trimmedQ, page, page_size);
    return { type: 'agents', ...result };
  }

  // 'all': run all three in parallel
  const [posts, subagoras, agents] = await Promise.all([
    searchPosts(trimmedQ, page, page_size),
    searchSubAgoras(trimmedQ, page, page_size),
    searchAgents(trimmedQ, page, page_size),
  ]);

  return { type: 'all', posts, subagoras, agents };
}

module.exports = { search };
