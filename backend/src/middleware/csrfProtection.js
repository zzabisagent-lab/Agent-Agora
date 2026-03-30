const config = require('../config/env');

function csrfProtection(req, res, next) {
  const headerToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies[config.csrf.cookieName];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return res.status(403).json({
      success: false,
      error_code: 'AUTH_CSRF_INVALID',
      error_message: 'Invalid CSRF token',
    });
  }
  next();
}

module.exports = csrfProtection;
