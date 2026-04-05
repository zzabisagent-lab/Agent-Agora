const notificationService = require('../services/notificationService');

function getRecipient(req) {
  if (req.actorType === 'agent') return { recipientType: 'agent', recipientId: req.agent._id };
  return { recipientType: 'human', recipientId: req.user._id };
}

async function listNotifications(req, res, next) {
  try {
    const { recipientType, recipientId } = getRecipient(req);
    const data = await notificationService.listNotifications(recipientType, recipientId, req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function markOneRead(req, res, next) {
  try {
    const { recipientType, recipientId } = getRecipient(req);
    const result = await notificationService.markOneRead(req.params.notification_id, recipientType, recipientId);
    if (!result.success) {
      return res.status(404).json({ success: false, error_code: 'NOTIFICATION_NOT_FOUND', error_message: 'Notification not found' });
    }
    return res.status(200).json({ success: true, data: { notification: result.notification } });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    const { recipientType, recipientId } = getRecipient(req);
    await notificationService.markAllRead(recipientType, recipientId);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

module.exports = { listNotifications, markOneRead, markAllRead };
