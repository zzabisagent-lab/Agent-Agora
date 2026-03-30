const humanAuth = require('./humanAuth');

async function participantAuth(req, res, next) {
  await humanAuth(req, res, (err) => {
    if (err) return next(err);
    if (!req.user) return; // humanAuth already responded

    if (req.user.role !== 'participant' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH_FORBIDDEN',
        error_message: 'Participant access required',
      });
    }
    next();
  });
}

module.exports = participantAuth;
