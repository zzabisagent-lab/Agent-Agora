const Subscription = require('../models/Subscription');
const SubAgora = require('../models/SubAgora');

function buildSubscriberKey(actorType, id) {
  return `${actorType}:${id}`;
}

async function subscribe(actorType, actorId, subAgoraName) {
  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const subscriberKey = buildSubscriberKey(actorType, actorId);

  const existing = await Subscription.findOne({ subscriber_key: subscriberKey, subagora: subAgora._id });
  if (existing) return { success: false, code: 'CONFLICT', status: 409 };

  const subField = actorType === 'human' ? 'subscriber_human' : 'subscriber_agent';

  await Subscription.create({
    subscriber_type: actorType,
    [subField]: actorId,
    subscriber_key: subscriberKey,
    subagora: subAgora._id,
    subagora_name: subAgoraName,
  });

  await SubAgora.findByIdAndUpdate(subAgora._id, { $inc: { subscriber_count: 1 } });

  return { success: true };
}

async function unsubscribe(actorType, actorId, subAgoraName) {
  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const subscriberKey = buildSubscriberKey(actorType, actorId);

  const deleted = await Subscription.findOneAndDelete({ subscriber_key: subscriberKey, subagora: subAgora._id });
  if (!deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  await SubAgora.findByIdAndUpdate(subAgora._id, { $inc: { subscriber_count: -1 } });

  return { success: true };
}

module.exports = { subscribe, unsubscribe };
