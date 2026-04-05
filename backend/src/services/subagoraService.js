const SubAgora = require('../models/SubAgora');

function encodeCursor(sortValue, id) {
  return Buffer.from(JSON.stringify({ v: sortValue, id: id.toString() })).toString('base64url');
}

function decodeCursor(cursor) {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

async function createSubAgora(actorType, actorId, body) {
  const { name, display_name, description, banner_color, theme_color } = body;

  const existing = await SubAgora.findOne({ name });
  if (existing) return { success: false, code: 'DUPLICATE_RESOURCE', status: 409 };

  const creatorField = actorType === 'human' ? 'created_by_human' : 'created_by_agent';
  const modField = actorType === 'human' ? 'user_human' : 'user_agent';

  const subAgora = await SubAgora.create({
    name,
    display_name,
    description,
    ...(banner_color && { banner_color }),
    ...(theme_color && { theme_color }),
    created_by_type: actorType,
    [creatorField]: actorId,
    moderators: [
      {
        user_type: actorType,
        [modField]: actorId,
        role: 'owner',
      },
    ],
  });

  return { success: true, subAgora };
}

async function listSubAgoras(query) {
  const { q, sort = 'featured', featured_only, cursor, limit } = query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));

  const filter = {};
  if (q) filter.$or = [
    { name: { $regex: q, $options: 'i' } },
    { display_name: { $regex: q, $options: 'i' } },
  ];
  if (featured_only === 'true' || featured_only === true) filter.is_featured = true;

  // Build sort and cursor filter
  let sortField;
  let sortOrder;
  if (sort === 'subscriber_count') {
    sortField = 'subscriber_count';
    sortOrder = -1;
  } else if (sort === 'name') {
    sortField = 'name';
    sortOrder = 1;
  } else {
    // 'featured' or default: is_featured desc, then created_at desc
    sortField = 'created_at';
    sortOrder = -1;
  }

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      const { v, id } = decoded;
      if (sortOrder === -1) {
        filter.$or = [
          { [sortField]: { $lt: v } },
          { [sortField]: v, _id: { $lt: id } },
        ];
      } else {
        filter.$or = [
          { [sortField]: { $gt: v } },
          { [sortField]: v, _id: { $gt: id } },
        ];
      }
    }
  }

  const items = await SubAgora.find(filter)
    .sort({ [sortField]: sortOrder, _id: sortOrder })
    .limit(limitNum + 1)
    .lean();

  const has_next = items.length > limitNum;
  const page_items = has_next ? items.slice(0, limitNum) : items;

  let next_cursor = null;
  if (has_next && page_items.length > 0) {
    const last = page_items[page_items.length - 1];
    next_cursor = encodeCursor(last[sortField], last._id);
  }

  return {
    items: page_items.map(serializeSubAgora),
    next_cursor,
    has_next,
  };
}

function serializeSubAgora(sa) {
  return {
    _id: sa._id,
    name: sa.name,
    display_name: sa.display_name,
    description: sa.description,
    banner_color: sa.banner_color || null,
    theme_color: sa.theme_color || null,
    is_featured: sa.is_featured,
    subscriber_count: sa.subscriber_count,
    posts_count: sa.posts_count,
    moderators: sa.moderators,
    pinned_posts: sa.pinned_posts,
    created_at: sa.created_at,
    updated_at: sa.updated_at,
  };
}

async function getSubAgora(subAgoraName) {
  const sa = await SubAgora.findOne({ name: subAgoraName }).lean();
  if (!sa) return null;
  return serializeSubAgora(sa);
}

async function updateSettings(subAgoraName, updates) {
  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const allowedFields = ['display_name', 'description', 'banner_color', 'theme_color', 'pinned_posts'];
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === 'pinned_posts') {
        if (updates.pinned_posts.length > 3) {
          return { success: false, code: 'PIN_LIMIT_EXCEEDED', status: 409 };
        }
      }
      subAgora[field] = updates[field];
    }
  }

  await subAgora.save();
  return { success: true, subAgora };
}

async function addModerator(subAgoraName, body) {
  const { user_type, user_id } = body;
  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const field = user_type === 'human' ? 'user_human' : 'user_agent';

  const existing = subAgora.moderators.find(
    (m) => m[field] && m[field].toString() === user_id.toString()
  );
  if (existing) return { success: false, code: 'CONFLICT', status: 409 };

  subAgora.moderators.push({
    user_type,
    [field]: user_id,
    role: 'regular',
  });
  await subAgora.save();

  return { success: true, subAgora };
}

async function removeModerator(subAgoraName, body) {
  const { user_type, user_id } = body;
  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const field = user_type === 'human' ? 'user_human' : 'user_agent';

  const idx = subAgora.moderators.findIndex(
    (m) => m[field] && m[field].toString() === user_id.toString()
  );
  if (idx < 0) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Only regular moderators can be removed via normal route
  if (subAgora.moderators[idx].role === 'owner') {
    return { success: false, code: 'AUTH_FORBIDDEN', status: 403 };
  }

  subAgora.moderators.splice(idx, 1);
  await subAgora.save();

  return { success: true, subAgora };
}

module.exports = {
  createSubAgora,
  listSubAgoras,
  getSubAgora,
  updateSettings,
  addModerator,
  removeModerator,
};
