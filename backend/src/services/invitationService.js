const crypto = require('crypto');
const bcrypt = require('bcrypt');
const Invitation = require('../models/Invitation');
const HumanUser = require('../models/HumanUser');
const Agent = require('../models/Agent');
const { generateApiKey } = require('../utils/apiKeys');
const config = require('../config/env');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function maskEmail(email) {
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${'*'.repeat(local.length)}@${domain}`;
  }
  return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

function derivePublicStatus(invitation) {
  if (invitation.status === 'pending' && invitation.expires_at < new Date()) {
    return 'expired';
  }
  if (invitation.status === 'accepted') {
    return 'used';
  }
  return invitation.status; // 'pending' or 'cancelled'
}

async function verifyInvitationToken(token) {
  const tokenHash = hashToken(token);
  const invitation = await Invitation.findOne({ token_hash: tokenHash });

  if (!invitation) {
    return { valid: false, status: 'invalid' };
  }

  const publicStatus = derivePublicStatus(invitation);

  if (publicStatus !== 'pending') {
    return { valid: false, status: publicStatus };
  }

  const result = {
    valid: true,
    status: 'valid',
    target_type: invitation.target_type,
    email_masked: maskEmail(invitation.email),
  };

  if (invitation.target_type === 'human') {
    result.human_role = invitation.human_role;
  } else {
    result.agent_name = invitation.agent_name;
  }

  return result;
}

async function humanAcceptInvite(token, { password, nickname }) {
  const tokenHash = hashToken(token);
  const invitation = await Invitation.findOne({ token_hash: tokenHash });

  if (!invitation) {
    return { success: false, code: 'INVITATION_INVALID', status: 400 };
  }

  const publicStatus = derivePublicStatus(invitation);
  if (publicStatus === 'expired') {
    return { success: false, code: 'INVITATION_EXPIRED', status: 410 };
  }
  if (publicStatus === 'used') {
    return { success: false, code: 'INVITATION_ALREADY_USED', status: 409 };
  }
  if (publicStatus === 'cancelled') {
    return { success: false, code: 'INVITATION_CANCELLED', status: 400 };
  }
  if (invitation.target_type !== 'human') {
    return { success: false, code: 'INVITATION_INVALID', status: 400 };
  }

  const existingEmail = await HumanUser.findOne({ email: invitation.email });
  if (existingEmail) {
    return { success: false, code: 'EMAIL_ALREADY_USED', status: 409 };
  }

  const existingNickname = await HumanUser.findOne({ nickname });
  if (existingNickname) {
    return { success: false, code: 'NICKNAME_ALREADY_USED', status: 409 };
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

  const user = await HumanUser.create({
    email: invitation.email,
    password_hash: passwordHash,
    nickname,
    role: invitation.human_role,
  });

  invitation.status = 'accepted';
  invitation.accepted_at = new Date();
  invitation.result_id = user._id;
  await invitation.save();

  return { success: true, user };
}

async function agentRegisterInvite(token, { description } = {}) {
  const tokenHash = hashToken(token);
  const invitation = await Invitation.findOne({ token_hash: tokenHash });

  if (!invitation) {
    return { success: false, code: 'INVITATION_INVALID', status: 400 };
  }

  const publicStatus = derivePublicStatus(invitation);
  if (publicStatus === 'expired') {
    return { success: false, code: 'INVITATION_EXPIRED', status: 410 };
  }
  if (publicStatus === 'used') {
    return { success: false, code: 'INVITATION_ALREADY_USED', status: 409 };
  }
  if (publicStatus === 'cancelled') {
    return { success: false, code: 'INVITATION_CANCELLED', status: 400 };
  }
  if (invitation.target_type !== 'agent') {
    return { success: false, code: 'INVITATION_INVALID', status: 400 };
  }

  const existingAgent = await Agent.findOne({ name: invitation.agent_name });
  if (existingAgent) {
    return { success: false, code: 'AGENT_NAME_TAKEN', status: 409 };
  }

  const { rawKey, hash, last4 } = await generateApiKey(config.agentApiKeyPrefix);

  const agent = await Agent.create({
    name: invitation.agent_name,
    ...(description && { description }),
    api_key_hash: hash,
    api_key_last4: last4,
    status: 'claimed',
    registration_type: 'invitation',
    owner_email: invitation.email,
    approved_by: invitation.invited_by,
    approved_at: new Date(),
  });

  invitation.status = 'accepted';
  invitation.accepted_at = new Date();
  invitation.result_id = agent._id;
  await invitation.save();

  return { success: true, agent, rawKey };
}

module.exports = { verifyInvitationToken, humanAcceptInvite, agentRegisterInvite };
