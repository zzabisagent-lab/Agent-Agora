const { validationResult } = require('express-validator');
const AdminAuditLog = require('../models/AdminAuditLog');
const HumanUser = require('../models/HumanUser');
const Agent = require('../models/Agent');
const SubAgora = require('../models/SubAgora');
const Invitation = require('../models/Invitation');
const adminInvitationService = require('../services/adminInvitationService');
const adminAgentService = require('../services/adminAgentService');
const adminHumanService = require('../services/adminHumanService');
const adminSubAgoraRescueService = require('../services/adminSubAgoraRescueService');

const ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Resource not found',
  CONFLICT: 'No change required',
  DUPLICATE_RESOURCE: 'Resource already exists',
  AGENT_NAME_TAKEN: 'Agent name is already taken',
  EMAIL_ALREADY_USED: 'Email is already registered',
  NICKNAME_ALREADY_USED: 'Nickname is already taken',
  INVITATION_ALREADY_USED: 'Invitation has already been used',
  INVITATION_CANCELLED: 'Invitation is already cancelled',
  LAST_ADMIN_PROTECTED: 'Cannot remove the last admin',
  OWNER_TRANSFER_INVALID: 'Target user is not a moderator of this subagora',
};

function extractRequestMeta(req) {
  return {
    ip: req.ip,
    userAgent: req.headers['user-agent'] || null,
  };
}

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error_code: 'VALIDATION_FAILED',
      error_message: 'One or more fields are invalid',
      details: { fields: Object.fromEntries(errors.array().map((e) => [e.path, e.msg])) },
    });
    return false;
  }
  return true;
}

function handleServiceError(res, result) {
  const httpMap = {
    RESOURCE_NOT_FOUND: 404,
    CONFLICT: 409,
    DUPLICATE_RESOURCE: 409,
    AGENT_NAME_TAKEN: 409,
    EMAIL_ALREADY_USED: 409,
    NICKNAME_ALREADY_USED: 409,
    INVITATION_ALREADY_USED: 409,
    INVITATION_CANCELLED: 409,
    LAST_ADMIN_PROTECTED: 409,
  };
  return res.status(result.status || httpMap[result.code] || 400).json({
    success: false,
    error_code: result.code,
    error_message: ERROR_MESSAGES[result.code] || 'Request failed',
  });
}

// GET /admin/stats
async function getStats(req, res, next) {
  try {
    const [humanCount, agentCount, subAgoraCount, pendingInvitations, suspendedAgents] =
      await Promise.all([
        HumanUser.countDocuments(),
        Agent.countDocuments(),
        SubAgora.countDocuments(),
        Invitation.countDocuments({ status: 'pending' }),
        Agent.countDocuments({ status: 'suspended' }),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          humans: humanCount,
          agents: agentCount,
          subagoras: subAgoraCount,
          pending_invitations: pendingInvitations,
          suspended_agents: suspendedAgents,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/invitations/human
async function createInvitationHuman(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminInvitationService.createInvitation(
      req.user._id, { ...req.body, target_type: 'human' }, extractRequestMeta(req)
    );
    return res.status(201).json({
      success: true,
      data: { invitation: result.invitation, credentials: result.credentials },
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error_code: err.error_code || 'CONFLICT',
        error_message: err.message,
      });
    }
    next(err);
  }
}

// POST /admin/invitations/agent
async function createInvitationAgent(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminInvitationService.createInvitation(
      req.user._id, { ...req.body, target_type: 'agent' }, extractRequestMeta(req)
    );
    return res.status(201).json({
      success: true,
      data: { invitation: result.invitation, credentials: result.credentials },
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({
        success: false,
        error_code: err.error_code || 'CONFLICT',
        error_message: err.message,
      });
    }
    next(err);
  }
}

// GET /admin/invitations
async function listInvitations(req, res, next) {
  try {
    const data = await adminInvitationService.listInvitations(req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /admin/invitations/:invitation_id
async function getInvitation(req, res, next) {
  try {
    const invitation = await adminInvitationService.getInvitation(req.params.invitation_id);
    if (!invitation) {
      return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Invitation not found' });
    }
    return res.status(200).json({ success: true, data: { invitation } });
  } catch (err) {
    next(err);
  }
}

// POST /admin/invitations/:invitation_id/resend
async function resendInvitation(req, res, next) {
  try {
    const result = await adminInvitationService.resendInvitation(
      req.user._id, req.params.invitation_id, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({
      success: true,
      data: { invitation: result.invitation, credentials: result.credentials },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/invitations/:invitation_id/cancel
async function cancelInvitation(req, res, next) {
  try {
    const result = await adminInvitationService.cancelInvitation(
      req.user._id, req.params.invitation_id, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { invitation: result.invitation } });
  } catch (err) {
    next(err);
  }
}

// POST /admin/agents
async function createAgentManual(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminAgentService.createAgentManual(
      req.user._id, req.body, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(201).json({
      success: true,
      data: {
        agent: {
          _id: result.agent._id,
          name: result.agent.name,
          status: result.agent.status,
          owner_email: result.agent.owner_email,
          created_at: result.agent.created_at,
        },
        reveal: { api_key: result.rawKey },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /admin/agents
async function listAgents(req, res, next) {
  try {
    const data = await adminAgentService.listAgents(req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /admin/agents/:agent_id
async function getAgent(req, res, next) {
  try {
    const agent = await adminAgentService.getAgent(req.params.agent_id);
    if (!agent) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Agent not found' });
    return res.status(200).json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

// PATCH /admin/agents/:agent_id/status
async function changeAgentStatus(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminAgentService.changeAgentStatus(
      req.user._id, req.params.agent_id, req.body.status, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { agent: { _id: result.agent._id, status: result.agent.status } } });
  } catch (err) {
    next(err);
  }
}

// POST /admin/agents/:agent_id/rotate-key
async function rotateAgentKey(req, res, next) {
  try {
    const result = await adminAgentService.rotateAgentKey(
      req.user._id, req.params.agent_id, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({
      success: true,
      data: {
        agent: { _id: result.agent._id, api_key_last4: result.agent.api_key_last4 },
        reveal: { api_key: result.rawKey },
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/agents/:agent_id/transfer-ownership
async function transferAgentOwnership(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminAgentService.transferAgentOwnership(
      req.user._id, req.params.agent_id, req.body.owner_email, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({
      success: true,
      data: { agent: { _id: result.agent._id, owner_email: result.agent.owner_email } },
    });
  } catch (err) {
    next(err);
  }
}

// POST /admin/humans
async function createHumanManual(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminHumanService.createHumanManual(
      req.user._id, req.body, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(201).json({
      success: true,
      data: {
        human: {
          _id: result.user._id,
          email: result.user.email,
          nickname: result.user.nickname,
          role: result.user.role,
        },
        reveal: { temp_password: result.tempPassword },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /admin/humans
async function listHumans(req, res, next) {
  try {
    const data = await adminHumanService.listHumans(req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// GET /admin/humans/:human_id
async function getHuman(req, res, next) {
  try {
    const human = await adminHumanService.getHuman(req.params.human_id);
    if (!human) return res.status(404).json({ success: false, error_code: 'RESOURCE_NOT_FOUND', error_message: 'Human not found' });
    return res.status(200).json({ success: true, data: { human } });
  } catch (err) {
    next(err);
  }
}

// PATCH /admin/humans/:human_id/role
async function changeHumanRole(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminHumanService.changeHumanRole(
      req.user._id, req.params.human_id, req.body.role, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { human: { _id: result.user._id, role: result.user.role } } });
  } catch (err) {
    next(err);
  }
}

// PATCH /admin/humans/:human_id/is-active
async function changeHumanIsActive(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminHumanService.changeHumanIsActive(
      req.user._id, req.params.human_id, req.body.is_active, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { human: { _id: result.user._id, is_active: result.user.is_active } } });
  } catch (err) {
    next(err);
  }
}

// POST /admin/subagoras/:subagora_name/moderators
async function rescueAddModerator(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminSubAgoraRescueService.addOrUpdateModerator(
      req.user._id, req.params.subagora_name, req.body, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { moderators: result.subAgora.moderators } });
  } catch (err) {
    next(err);
  }
}

// DELETE /admin/subagoras/:subagora_name/moderators
async function rescueRemoveModerator(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminSubAgoraRescueService.removeModerator(
      req.user._id, req.params.subagora_name, req.body, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { moderators: result.subAgora.moderators } });
  } catch (err) {
    next(err);
  }
}

// POST /admin/subagoras/:subagora_name/transfer-owner
async function rescueTransferOwner(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const result = await adminSubAgoraRescueService.transferOwner(
      req.user._id, req.params.subagora_name, req.body, extractRequestMeta(req)
    );
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: { moderators: result.subAgora.moderators } });
  } catch (err) {
    next(err);
  }
}

// GET /admin/audit-logs
async function listAuditLogs(req, res, next) {
  try {
    const { action, target_type, actor_email, from, to } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const page_size = Math.min(100, Math.max(1, parseInt(req.query.page_size, 10) || 20));

    const filter = {};
    if (action) filter.action = action;
    if (target_type) filter.target_type = target_type;

    if (actor_email) {
      const actor = await HumanUser.findOne({ email: actor_email.toLowerCase() }).select('_id').lean();
      if (actor) {
        filter.actor_human = actor._id;
      } else {
        // No matching actor → return empty
        return res.status(200).json({
          success: true,
          data: {
            items: [],
            pagination: { page, page_size, total_count: 0, total_pages: 1 },
          },
        });
      }
    }

    if (from || to) {
      filter.created_at = {};
      if (from) filter.created_at.$gte = new Date(from);
      if (to) filter.created_at.$lte = new Date(to);
    }

    const skip = (page - 1) * page_size;
    const [items, total_count] = await Promise.all([
      AdminAuditLog.find(filter).sort({ created_at: -1 }).skip(skip).limit(page_size)
        .populate('actor_human', 'email nickname').lean(),
      AdminAuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          page_size,
          total_count,
          total_pages: Math.ceil(total_count / page_size) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStats,
  createInvitationHuman,
  createInvitationAgent,
  listInvitations,
  getInvitation,
  resendInvitation,
  cancelInvitation,
  createAgentManual,
  listAgents,
  getAgent,
  changeAgentStatus,
  rotateAgentKey,
  transferAgentOwnership,
  createHumanManual,
  listHumans,
  getHuman,
  changeHumanRole,
  changeHumanIsActive,
  rescueAddModerator,
  rescueRemoveModerator,
  rescueTransferOwner,
  listAuditLogs,
};
