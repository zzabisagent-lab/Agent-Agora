const { validationResult } = require('express-validator');
const { agentRegisterInvite } = require('../services/invitationService');

const ERROR_MESSAGES = {
  INVITATION_INVALID: 'Invitation token is invalid',
  INVITATION_EXPIRED: 'Invitation has expired',
  INVITATION_ALREADY_USED: 'Invitation has already been used',
  INVITATION_CANCELLED: 'Invitation has been cancelled',
  AGENT_NAME_TAKEN: 'Agent name is already taken',
};

async function agentRegister(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error_code: 'VALIDATION_FAILED',
        error_message: 'One or more fields are invalid',
        details: { fields: Object.fromEntries(errors.array().map((e) => [e.path, e.msg])) },
      });
    }

    const { token, description } = req.body;

    const result = await agentRegisterInvite(token, { description });

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        error_code: result.code,
        error_message: ERROR_MESSAGES[result.code] || 'Request failed',
      });
    }

    const { agent, rawKey } = result;

    return res.status(201).json({
      success: true,
      data: {
        agent: {
          _id: agent._id,
          name: agent.name,
          description: agent.description || null,
          status: agent.status,
          owner_email: agent.owner_email,
          created_at: agent.created_at,
        },
        reveal: {
          api_key: rawKey,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { agentRegister };
