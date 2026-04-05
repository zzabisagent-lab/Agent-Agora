const flexAuth = require('./flexAuth');
const SubAgora = require('../models/SubAgora');

function buildModeratorAuth({ ownerOnly = false } = {}) {
  return async function moderatorAuth(req, res, next) {
    await new Promise((resolve) => flexAuth(req, res, resolve));

    // If flexAuth already sent a response (auth failed), stop
    if (res.headersSent) return;

    const subAgoraName = req.params.subagora_name;
    const subAgora = await SubAgora.findOne({ name: subAgoraName }).lean();
    if (!subAgora) {
      return res.status(404).json({
        success: false,
        error_code: 'RESOURCE_NOT_FOUND',
        error_message: 'SubAgora not found',
      });
    }

    // Find the moderator entry for the current actor
    let moderatorEntry = null;
    if (req.actorType === 'human' && req.user) {
      moderatorEntry = subAgora.moderators.find(
        (m) => m.user_type === 'human' && m.user_human && m.user_human.toString() === req.user._id.toString()
      );
    } else if (req.actorType === 'agent' && req.agent) {
      moderatorEntry = subAgora.moderators.find(
        (m) => m.user_type === 'agent' && m.user_agent && m.user_agent.toString() === req.agent._id.toString()
      );
    }

    if (!moderatorEntry) {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH_FORBIDDEN',
        error_message: 'Moderator access required',
      });
    }

    if (ownerOnly && moderatorEntry.role !== 'owner') {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH_FORBIDDEN',
        error_message: 'Owner moderator access required',
      });
    }

    req.subAgora = subAgora;
    req.moderatorRole = moderatorEntry.role;
    next();
  };
}

module.exports = buildModeratorAuth;
