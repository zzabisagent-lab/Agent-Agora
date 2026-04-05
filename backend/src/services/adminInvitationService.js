const crypto = require('crypto');
const Invitation = require('../models/Invitation');
const { writeAuditLog } = require('./adminAuditService');
const config = require('../config/env');

function generateRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function buildExpiresAt() {
  const d = new Date();
  d.setDate(d.getDate() + config.invitationExpiresDays);
  return d;
}

function buildInvitationFilter(query) {
  const filter = {};
  const { status, target_type, email, from, to } = query;

  if (status === 'expired') {
    filter.status = 'pending';
    filter.expires_at = { $lt: new Date() };
  } else if (status) {
    filter.status = status;
  }

  if (target_type) filter.target_type = target_type;
  if (email) filter.email = email.toLowerCase();

  if (from || to) {
    filter.created_at = {};
    if (from) filter.created_at.$gte = new Date(from);
    if (to) filter.created_at.$lte = new Date(to);
  }

  return filter;
}

async function createInvitation(actorId, body, requestMeta) {
  const { target_type, email, human_role, agent_name } = body;

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  const invitationData = {
    target_type,
    email: email.toLowerCase(),
    token_hash: tokenHash,
    invited_by: actorId,
    expires_at: buildExpiresAt(),
    ...(target_type === 'human' ? { human_role } : { agent_name }),
  };

  const invitation = await Invitation.create(invitationData);

  await writeAuditLog(actorId, 'INVITATION_CREATED', 'invitation', invitation._id,
    `Created ${target_type} invitation for ${email}`,
    { after: { target_type, email, human_role, agent_name }, ...requestMeta }
  );

  return { invitation, rawToken };
}

async function resendInvitation(actorId, invitationId, requestMeta) {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Only pending (including expired) invitations can be resent
  if (invitation.status !== 'pending') {
    return { success: false, code: 'INVITATION_ALREADY_USED', status: 409 };
  }

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);

  invitation.token_hash = tokenHash;
  invitation.expires_at = buildExpiresAt();
  invitation.resend_count += 1;
  await invitation.save();

  await writeAuditLog(actorId, 'INVITATION_RESENT', 'invitation', invitation._id,
    `Resent invitation for ${invitation.email}`,
    { metadata: { resend_count: invitation.resend_count }, ...requestMeta }
  );

  return { success: true, invitation, rawToken };
}

async function cancelInvitation(actorId, invitationId, requestMeta) {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Only pending (non-expired) invitations can be cancelled
  if (invitation.status !== 'pending') {
    if (invitation.status === 'accepted') {
      return { success: false, code: 'INVITATION_ALREADY_USED', status: 409 };
    }
    return { success: false, code: 'INVITATION_CANCELLED', status: 409 };
  }
  // Expired (pending but past expires_at) can still be cancelled
  const before = { status: invitation.status };

  invitation.status = 'cancelled';
  invitation.cancelled_at = new Date();
  await invitation.save();

  await writeAuditLog(actorId, 'INVITATION_CANCELLED', 'invitation', invitation._id,
    `Cancelled invitation for ${invitation.email}`,
    { before, after: { status: 'cancelled' }, ...requestMeta }
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

async function getInvitation(invitationId) {
  const invitation = await Invitation.findById(invitationId).lean();
  if (!invitation) return null;
  return invitation;
}

module.exports = { createInvitation, resendInvitation, cancelInvitation, listInvitations, getInvitation };
