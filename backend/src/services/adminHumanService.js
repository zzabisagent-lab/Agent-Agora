const crypto = require('crypto');
const bcrypt = require('bcrypt');
const HumanUser = require('../models/HumanUser');
const { writeAuditLog } = require('./adminAuditService');
const config = require('../config/env');

function buildHumanFilter(query) {
  const filter = {};
  const { role, is_active, email, nickname, from, to } = query;

  if (role) filter.role = role;
  if (is_active !== undefined) filter.is_active = is_active === 'true' || is_active === true;
  if (email) filter.email = email.toLowerCase();
  if (nickname) filter.nickname = { $regex: nickname, $options: 'i' };

  if (from || to) {
    filter.created_at = {};
    if (from) filter.created_at.$gte = new Date(from);
    if (to) filter.created_at.$lte = new Date(to);
  }

  return filter;
}

async function createHumanManual(actorId, body, requestMeta) {
  const { email, nickname, role } = body;

  const existingEmail = await HumanUser.findOne({ email: email.toLowerCase() });
  if (existingEmail) return { success: false, code: 'EMAIL_ALREADY_USED', status: 409 };

  const existingNickname = await HumanUser.findOne({ nickname });
  if (existingNickname) return { success: false, code: 'NICKNAME_ALREADY_USED', status: 409 };

  const tempPassword = crypto.randomBytes(12).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, config.bcryptSaltRounds);

  const user = await HumanUser.create({
    email: email.toLowerCase(),
    password_hash: passwordHash,
    nickname,
    role: role || 'viewer',
  });

  await writeAuditLog(actorId, 'HUMAN_CREATED_MANUAL', 'human', user._id,
    `Manually created human user ${email}`,
    { after: { email, nickname, role }, ...requestMeta }
  );

  return { success: true, user, tempPassword };
}

async function listHumans(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const page_size = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 20));
  const filter = buildHumanFilter(query);
  const skip = (page - 1) * page_size;

  const [items, total_count] = await Promise.all([
    HumanUser.find(filter).sort({ created_at: -1 }).skip(skip).limit(page_size)
      .select('_id email nickname role is_active last_login_at created_at').lean(),
    HumanUser.countDocuments(filter),
  ]);

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

async function getHuman(humanId) {
  const user = await HumanUser.findById(humanId)
    .select('_id email nickname role is_active owned_agents last_login_at created_at updated_at')
    .lean();
  return user || null;
}

async function changeHumanRole(actorId, humanId, newRole, requestMeta) {
  const user = await HumanUser.findById(humanId);
  if (!user) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };
  if (user.role === newRole) return { success: false, code: 'CONFLICT', status: 409 };

  // Protect last admin
  if (user.role === 'admin') {
    const adminCount = await HumanUser.countDocuments({ role: 'admin' });
    if (adminCount <= 1) return { success: false, code: 'LAST_ADMIN_PROTECTED', status: 409 };
  }

  const before = { role: user.role };
  user.role = newRole;
  await user.save();

  await writeAuditLog(actorId, 'HUMAN_ROLE_CHANGED', 'human', user._id,
    `Human user ${user.email} role changed from ${before.role} to ${newRole}`,
    { before, after: { role: newRole }, ...requestMeta }
  );

  return { success: true, user };
}

async function changeHumanIsActive(actorId, humanId, isActive, requestMeta) {
  const user = await HumanUser.findById(humanId);
  if (!user) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };
  if (user.is_active === isActive) return { success: false, code: 'CONFLICT', status: 409 };

  const before = { is_active: user.is_active };
  user.is_active = isActive;
  await user.save();

  await writeAuditLog(actorId, 'HUMAN_ACTIVE_CHANGED', 'human', user._id,
    `Human user ${user.email} is_active changed to ${isActive}`,
    { before, after: { is_active: isActive }, ...requestMeta }
  );

  return { success: true, user };
}

module.exports = {
  createHumanManual,
  listHumans,
  getHuman,
  changeHumanRole,
  changeHumanIsActive,
};
