const { verifyToken } = require('../utils/jwt');
const HumanUser = require('../models/HumanUser');
const config = require('../config/env');

async function humanAuth(req, res, next) {
  try {
    const token = req.cookies[config.jwt.cookieName];
    if (!token) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_UNAUTHORIZED',
        error_message: 'Authentication required',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_UNAUTHORIZED',
        error_message: 'Invalid or expired token',
      });
    }

    const user = await HumanUser.findById(decoded.user_id).select('_id email nickname role is_active');
    if (!user) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_UNAUTHORIZED',
        error_message: 'User not found',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_ACCOUNT_DISABLED',
        error_message: 'Account is disabled',
      });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      is_active: user.is_active,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = humanAuth;
