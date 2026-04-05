const { validationResult } = require('express-validator');
const { verifyInvitationToken, humanAcceptInvite } = require('../services/invitationService');
const { signToken } = require('../utils/jwt');
const { generateCsrfToken, setCsrfCookie } = require('../utils/csrf');
const config = require('../config/env');

const ERROR_MESSAGES = {
  INVITATION_INVALID: 'Invitation token is invalid',
  INVITATION_EXPIRED: 'Invitation has expired',
  INVITATION_ALREADY_USED: 'Invitation has already been used',
  INVITATION_CANCELLED: 'Invitation has been cancelled',
  EMAIL_ALREADY_USED: 'Email is already registered',
  NICKNAME_ALREADY_USED: 'Nickname is already taken',
};

async function verifyToken(req, res, next) {
  try {
    const { token } = req.params;
    const result = await verifyInvitationToken(token);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function humanAccept(req, res, next) {
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

    const { token, password, nickname, auto_login = false } = req.body;

    const result = await humanAcceptInvite(token, { password, nickname });

    if (!result.success) {
      return res.status(result.status).json({
        success: false,
        error_code: result.code,
        error_message: ERROR_MESSAGES[result.code] || 'Request failed',
      });
    }

    const { user } = result;

    const responseData = {
      human: {
        _id: user._id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
      },
    };

    if (auto_login) {
      const jwtToken = signToken({ user_id: user._id, role: user.role });
      res.cookie(config.jwt.cookieName, jwtToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: config.nodeEnv === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      const csrfToken = generateCsrfToken();
      setCsrfCookie(res, csrfToken);
    }

    return res.status(201).json({ success: true, data: responseData });
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyToken, humanAccept };
