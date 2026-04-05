const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const HumanUser = require('../models/HumanUser');
const { signToken } = require('../utils/jwt');
const { generateCsrfToken, setCsrfCookie } = require('../utils/csrf');
const config = require('../config/env');

function parseDurationToMs(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

function setAccessCookie(res, token, secure) {
  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: parseDurationToMs(config.jwt.expiresIn),
    path: '/',
  });
}

function clearAuthCookies(res, secure) {
  const cookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: 0,
    path: '/',
  };
  res.cookie(config.jwt.cookieName, '', cookieOptions);
  res.cookie(config.csrf.cookieName, '', {
    httpOnly: false,
    sameSite: 'lax',
    secure,
    maxAge: 0,
    path: '/',
  });
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error_code: 'VALIDATION_FAILED',
        error_message: 'Validation failed',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await HumanUser.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_INVALID_CREDENTIALS',
        error_message: 'Invalid email or password',
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_ACCOUNT_DISABLED',
        error_message: 'Account is disabled',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_INVALID_CREDENTIALS',
        error_message: 'Invalid email or password',
      });
    }

    const token = signToken({ user_id: user._id, role: user.role });
    setAccessCookie(res, token, req.secure);

    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken, req.secure);

    await HumanUser.findByIdAndUpdate(user._id, { $set: { last_login_at: new Date() } });

    return res.status(200).json({
      success: true,
      data: {
        human: {
          _id: user._id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    clearAuthCookies(res, req.secure);
    return res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await HumanUser.findById(req.user._id).select(
      '_id email nickname role is_active last_login_at created_at'
    );
    return res.status(200).json({
      success: true,
      data: { human: user },
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error_code: 'VALIDATION_FAILED',
        error_message: 'Validation failed',
        details: errors.array(),
      });
    }

    const { nickname } = req.body;

    let updated;
    try {
      updated = await HumanUser.findByIdAndUpdate(
        req.user._id,
        { ...(nickname !== undefined && { nickname }) },
        { new: true, runValidators: true }
      ).select('_id email nickname role');
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          error_code: 'NICKNAME_ALREADY_USED',
          error_message: 'Nickname is already taken',
        });
      }
      throw err;
    }

    return res.status(200).json({
      success: true,
      data: { human: updated },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, logout, getMe, updateProfile };
