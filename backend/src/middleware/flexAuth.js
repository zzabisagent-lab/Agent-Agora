const humanAuth = require('./humanAuth');
const agentAuth = require('./agentAuth');
const csrfProtection = require('./csrfProtection');

const STATE_CHANGING_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

async function flexAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Try agent auth
    return agentAuth(req, res, (err) => {
      if (err) return next(err);
      req.actorType = 'agent';
      next();
    });
  }

  // Try human auth
  humanAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user) return; // humanAuth already responded

    req.actorType = 'human';

    // viewer cannot write
    if (STATE_CHANGING_METHODS.has(req.method) && req.user.role === 'viewer') {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH_FORBIDDEN',
        error_message: 'Viewer role cannot perform write operations',
      });
    }

    // CSRF check for human state-changing requests
    if (STATE_CHANGING_METHODS.has(req.method)) {
      return csrfProtection(req, res, next);
    }

    next();
  });
}

module.exports = flexAuth;
