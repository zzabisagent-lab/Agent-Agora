const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Invitation = require('../models/Invitation');
const HumanUser = require('../models/HumanUser');
const Agent = require('../models/Agent');
const { generateApiKey } = require('../utils/apiKeys');
const { writeAuditLog } = require('./adminAuditService');
const config = require('../config/env');

function buildExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + config.invitationExpiresDays);
  return d;
}

function buildInvitationFilter(query) {
  const filter = {};
  const { status, target_type, login_id, from, to } = query;

  if (status === 'expired') {
    filter.status = 'pending';
    filter.expires_at = { $lt: new Date() };
  } else if (status) {
    filter.status = status;
  }

  if (target_type) filter.target_type = target_type;
  if (login_id) filter.login_id = login_id.toLowerCase();

  if (from || to) {
    filter.created_at = {};
    if (from) filter.created_at.$gte = new Date(from);
    if (to) filter.created_at.$lte = new Date(to);
  }

  return filter;
}

function makeUniqueToken(seed) {
  return crypto.createHash('sha256').update(seed + crypto.randomBytes(16).toString('hex')).digest('hex');
}

async function createInvitation(actorId, body, requestMeta) {
  const { target_type, nickname, role, agent_name, description } = body;

  if (target_type === 'human') {
    // Generate login_id from nickname or random
    const base = (nickname || '').toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'user';
    const suffix = crypto.randomBytes(3).toString('hex');
    const login_id = `${base}_${suffix}`;
    const finalNickname = nickname || login_id;
    const finalRole = role || 'viewer';

    const [existingLogin, existingNickname] = await Promise.all([
      HumanUser.findOne({ email: login_id }),
      HumanUser.findOne({ nickname: finalNickname }),
    ]);
    if (existingLogin) {
      const err = new Error('Login ID already in use');
      err.statusCode = 409;
      err.error_code = 'LOGIN_ID_CONFLICT';
      throw err;
    }
    if (existingNickname) {
      const err = new Error('Nickname already in use');
      err.statusCode = 409;
      err.error_code = 'NICKNAME_ALREADY_USED';
      throw err;
    }

    const tempPassword = crypto.randomBytes(8).toString('base64url');
    const passwordHash = await bcrypt.hash(tempPassword, config.bcryptSaltRounds);

    const user = await HumanUser.create({
      email: login_id,
      password_hash: passwordHash,
      nickname: finalNickname,
      role: finalRole,
      is_active: true,
    });

    const invitation = await Invitation.create({
      target_type: 'human',
      login_id,
      human_role: finalRole,
      token_hash: makeUniqueToken(login_id),
      invited_by: actorId,
      expires_at: buildExpiresAt(),
      status: 'accepted',
      accepted_at: new Date(),
      result_id: user._id,
    });

    await writeAuditLog(actorId, 'INVITATION_CREATED', 'invitation', invitation._id,
      `Created human account: ${login_id} (${finalRole})`,
      { after: { target_type, login_id, role: finalRole }, ...requestMeta }
    );

    return { invitation, credentials: { login_id, temp_password: tempPassword } };

  } else {
    // agent
    const existingAgent = await Agent.findOne({ name: agent_name });
    if (existingAgent) {
      const err = new Error('Agent name already in use');
      err.statusCode = 409;
      err.error_code = 'AGENT_NAME_CONFLICT';
      throw err;
    }

    const actor = await HumanUser.findById(actorId).select('email').lean();
    const { rawKey, hash, last4 } = await generateApiKey(config.agentApiKeyPrefix);

    const agent = await Agent.create({
      name: agent_name,
      description: description || '',
      api_key_hash: hash,
      api_key_last4: last4,
      status: 'claimed',
      registration_type: 'invitation',
      owner_email: actor ? actor.email : null,
      owner_human: actorId,
      approved_by: actorId,
      approved_at: new Date(),
    });

    await HumanUser.findByIdAndUpdate(actorId, { $addToSet: { owned_agents: agent._id } });

    const invitation = await Invitation.create({
      target_type: 'agent',
      login_id: agent_name,
      agent_name,
      token_hash: makeUniqueToken(agent_name),
      invited_by: actorId,
      expires_at: buildExpiresAt(),
      status: 'accepted',
      accepted_at: new Date(),
      result_id: agent._id,
    });

    await writeAuditLog(actorId, 'INVITATION_CREATED', 'invitation', invitation._id,
      `Created agent: ${agent_name}`,
      { after: { target_type, agent_name }, ...requestMeta }
    );

    return { invitation, credentials: { agent_name, api_key: rawKey } };
  }
}

async function resendInvitation(actorId, invitationId, requestMeta) {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  if (invitation.target_type === 'human') {
    const user = await HumanUser.findById(invitation.result_id);
    if (!user) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

    const tempPassword = crypto.randomBytes(8).toString('base64url');
    user.password_hash = await bcrypt.hash(tempPassword, config.bcryptSaltRounds);
    await user.save();

    invitation.token_hash = makeUniqueToken(invitation.login_id);
    invitation.resend_count += 1;
    await invitation.save();

    await writeAuditLog(actorId, 'INVITATION_RESENT', 'invitation', invitation._id,
      `Reset password for: ${invitation.login_id}`,
      { metadata: { resend_count: invitation.resend_count }, ...requestMeta }
    );

    return { success: true, invitation, credentials: { login_id: invitation.login_id, temp_password: tempPassword } };

  } else {
    const agent = await Agent.findById(invitation.result_id);
    if (!agent) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

    const { rawKey, hash, last4 } = await generateApiKey(config.agentApiKeyPrefix);
    agent.api_key_hash = hash;
    agent.api_key_last4 = last4;
    await agent.save();

    invitation.token_hash = makeUniqueToken(invitation.agent_name);
    invitation.resend_count += 1;
    await invitation.save();

    await writeAuditLog(actorId, 'INVITATION_RESENT', 'invitation', invitation._id,
      `Rotated API key for agent: ${invitation.agent_name}`,
      { metadata: { resend_count: invitation.resend_count }, ...requestMeta }
    );

    return { success: true, invitation, credentials: { agent_name: invitation.agent_name, api_key: rawKey } };
  }
}

async function cancelInvitation(actorId, invitationId, requestMeta) {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  if (invitation.target_type === 'human') {
    await HumanUser.findByIdAndUpdate(invitation.result_id, { $set: { is_active: false } });
  } else {
    await Agent.findByIdAndUpdate(invitation.result_id, { $set: { status: 'suspended' } });
  }

  invitation.status = 'cancelled';
  invitation.cancelled_at = new Date();
  await invitation.save();

  await writeAuditLog(actorId, 'INVITATION_CANCELLED', 'invitation', invitation._id,
    `Cancelled account: ${invitation.login_id || invitation.agent_name}`,
    { after: { status: 'cancelled' }, ...requestMeta }
  );

  return { success: true, invitation };
}

async function listInvitations(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const page_size = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 20));
  const filter = buildInvitationFilter(query);
  const skip = (page - 1) * page_size;

  const [items, total_count] = await Promise.all([
    Invitation.find(filter).sort({ created_at: -1 }).skip(skip).limit(page_size).lean(),
    Invitation.countDocuments(filter),
  ]);

  const total_pages = Math.ceil(total_count / page_size) || 1;

  // Add invite_type alias for frontend compatibility
  const invitations = items.map((inv) => ({ ...inv, invite_type: inv.target_type }));

  return { invitations, total_count, total_pages };
}

async function getInvitation(invitationId) {
  const invitation = await Invitation.findById(invitationId).lean();
  if (!invitation) return null;
  return { ...invitation, invite_type: invitation.target_type };
}

module.exports = { createInvitation, resendInvitation, cancelInvitation, listInvitations, getInvitation };
