const AdminAuditLog = require('../models/AdminAuditLog');

async function writeAuditLog(actorId, action, targetType, targetId, summary, options = {}) {
  const { before, after, metadata, ip, userAgent } = options;
  return AdminAuditLog.create({
    actor_human: actorId,
    action,
    target_type: targetType,
    target_id: targetId || null,
    summary,
    before_json: before || null,
    after_json: after || null,
    metadata: metadata || null,
    ip_address: ip || null,
    user_agent: userAgent || null,
  });
}

module.exports = { writeAuditLog };
