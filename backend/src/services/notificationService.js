const Notification = require('../models/Notification');

function buildRecipientKey(type, id) {
  return `${type}:${id}`;
}

function buildActorKey(type, id) {
  return `${type}:${id}`;
}

/**
 * Create a notification. Silently skips self-notify and duplicates.
 */
async function createNotification({
  type,
  recipientType,
  recipientId,
  actorType,
  actorId,
  actorName,
  post = null,
  comment = null,
  subagora = null,
  message,
}) {
  const recipientKey = buildRecipientKey(recipientType, recipientId);
  const actorKey = buildActorKey(actorType, actorId);

  // Self-notify suppression
  if (recipientKey === actorKey) return null;

  // Duplicate suppression: same type + recipient + post + comment
  const dupFilter = { type, recipient_key: recipientKey };
  if (post) dupFilter.post = post;
  if (comment) dupFilter.comment = comment;
  const existing = await Notification.findOne(dupFilter).lean();
  if (existing) return null;

  const recipientField = recipientType === 'human' ? 'recipient_human' : 'recipient_agent';
  const actorField = actorType === 'human' ? 'actor_human' : 'actor_agent';

  return Notification.create({
    recipient_type: recipientType,
    [recipientField]: recipientId,
    recipient_key: recipientKey,
    type,
    actor_type: actorType,
    [actorField]: actorId,
    actor_name: actorName,
    post: post || null,
    comment: comment || null,
    subagora: subagora || null,
    message,
  });
}

async function getUnreadCount(recipientType, recipientId) {
  const recipientKey = buildRecipientKey(recipientType, recipientId);
  return Notification.countDocuments({ recipient_key: recipientKey, is_read: false });
}

async function listNotifications(recipientType, recipientId, query) {
  const { only_unread, cursor, limit } = query;
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 25));
  const recipientKey = buildRecipientKey(recipientType, recipientId);

  const filter = { recipient_key: recipientKey };
  if (only_unread === 'true' || only_unread === true) filter.is_read = false;

  if (cursor) {
    try {
      const decoded = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
      filter.created_at = { $lt: new Date(decoded.created_at) };
    } catch {
      // ignore invalid cursor
    }
  }

  const [items, unread_count] = await Promise.all([
    Notification.find(filter)
      .sort({ created_at: -1 })
      .limit(limitNum + 1)
      .lean(),
    getUnreadCount(recipientType, recipientId),
  ]);

  const has_next = items.length > limitNum;
  const page_items = has_next ? items.slice(0, limitNum) : items;

  let next_cursor = null;
  if (has_next && page_items.length > 0) {
    const last = page_items[page_items.length - 1];
    next_cursor = Buffer.from(JSON.stringify({ created_at: last.created_at.toISOString() })).toString('base64url');
  }

  return { items: page_items, next_cursor, has_next, unread_count };
}

async function markOneRead(notificationId, recipientType, recipientId) {
  const recipientKey = buildRecipientKey(recipientType, recipientId);
  const notification = await Notification.findOne({ _id: notificationId, recipient_key: recipientKey });
  if (!notification) return { success: false, code: 'NOTIFICATION_NOT_FOUND', status: 404 };

  if (!notification.is_read) {
    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();
  }

  return { success: true, notification };
}

async function markAllRead(recipientType, recipientId) {
  const recipientKey = buildRecipientKey(recipientType, recipientId);
  await Notification.updateMany(
    { recipient_key: recipientKey, is_read: false },
    { $set: { is_read: true, read_at: new Date() } }
  );
  return { success: true };
}

module.exports = {
  createNotification,
  getUnreadCount,
  listNotifications,
  markOneRead,
  markAllRead,
};
