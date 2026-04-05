const SubAgora = require('../models/SubAgora');
const HumanUser = require('../models/HumanUser');
const Agent = require('../models/Agent');
const { writeAuditLog } = require('./adminAuditService');

async function resolveUser(user_type, user_id) {
  if (user_type === 'human') {
    return HumanUser.findById(user_id).lean();
  }
  return Agent.findById(user_id).lean();
}

async function addOrUpdateModerator(actorId, subAgoraName, body, requestMeta) {
  const { user_type, user_id, role } = body;

  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const targetUser = await resolveUser(user_type, user_id);
  if (!targetUser) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const field = user_type === 'human' ? 'user_human' : 'user_agent';
  const existingIdx = subAgora.moderators.findIndex(
    (m) => m[field] && m[field].toString() === user_id.toString()
  );

  if (existingIdx >= 0) {
    subAgora.moderators[existingIdx].role = role;
  } else {
    subAgora.moderators.push({
      user_type,
      [field]: user_id,
      role,
    });
  }

  await subAgora.save();

  await writeAuditLog(actorId, 'SUBAGORA_MODERATOR_RESCUED', 'subagora', subAgora._id,
    `Admin rescue: ${existingIdx >= 0 ? 'updated' : 'added'} moderator ${user_id} (${user_type}) with role ${role} in /a/${subAgoraName}`,
    { metadata: { user_type, user_id, role, action: existingIdx >= 0 ? 'updated' : 'added' }, ...requestMeta }
  );

  return { success: true, subAgora };
}

async function removeModerator(actorId, subAgoraName, body, requestMeta) {
  const { user_type, user_id } = body;

  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const field = user_type === 'human' ? 'user_human' : 'user_agent';
  const existingIdx = subAgora.moderators.findIndex(
    (m) => m[field] && m[field].toString() === user_id.toString()
  );

  if (existingIdx < 0) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  subAgora.moderators.splice(existingIdx, 1);
  await subAgora.save();

  await writeAuditLog(actorId, 'SUBAGORA_MODERATOR_RESCUED', 'subagora', subAgora._id,
    `Admin rescue: removed moderator ${user_id} (${user_type}) from /a/${subAgoraName}`,
    { metadata: { user_type, user_id, action: 'removed' }, ...requestMeta }
  );

  return { success: true, subAgora };
}

async function transferOwner(actorId, subAgoraName, body, requestMeta) {
  const { user_type, user_id } = body;

  const subAgora = await SubAgora.findOne({ name: subAgoraName });
  if (!subAgora) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const targetField = user_type === 'human' ? 'user_human' : 'user_agent';
  const targetIdx = subAgora.moderators.findIndex(
    (m) => m[targetField] && m[targetField].toString() === user_id.toString()
  );

  if (targetIdx < 0) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Demote current owner(s) to regular
  subAgora.moderators.forEach((m, i) => {
    if (i !== targetIdx && m.role === 'owner') {
      subAgora.moderators[i].role = 'regular';
    }
  });

  // Promote target to owner
  subAgora.moderators[targetIdx].role = 'owner';
  await subAgora.save();

  await writeAuditLog(actorId, 'SUBAGORA_OWNER_TRANSFERRED', 'subagora', subAgora._id,
    `Admin transfer: /a/${subAgoraName} ownership transferred to ${user_id} (${user_type})`,
    { metadata: { user_type, user_id }, ...requestMeta }
  );

  return { success: true, subAgora };
}

module.exports = { addOrUpdateModerator, removeModerator, transferOwner };
