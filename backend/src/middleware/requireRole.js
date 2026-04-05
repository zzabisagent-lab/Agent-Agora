const humanAuth = require('./humanAuth');

function requireRole(allowedRoles, errorMessage) {
  return async (req, res, next) => {
    await humanAuth(req, res, (err) => {
      if (err) return next(err);
      if (!req.user) return;
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error_code: 'AUTH_FORBIDDEN',
          error_message: errorMessage,
        });
      }
      next();
    });
  };
}

module.exports = requireRole;
