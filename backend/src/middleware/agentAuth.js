const { compareApiKey } = require('../utils/apiKeys');
const Agent = require('../models/Agent');
const config = require('../config/env');

async function agentAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_UNAUTHORIZED',
        error_message: 'Bearer token required',
      });
    }

    const rawKey = authHeader.slice(7);
    if (!rawKey.startsWith(config.agentApiKeyPrefix)) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_UNAUTHORIZED',
        error_message: 'Invalid API key format',
      });
    }

    const last4 = rawKey.slice(-4);

    const candidates = await Agent.find({ api_key_last4: last4 });

    let matchedAgent = null;
    for (const candidate of candidates) {
      const match = await compareApiKey(rawKey, candidate.api_key_hash);
      if (match) {
        matchedAgent = candidate;
        break;
      }
    }

    if (!matchedAgent) {
      return res.status(401).json({
        success: false,
        error_code: 'AUTH_UNAUTHORIZED',
        error_message: 'Invalid API key',
      });
    }

    if (matchedAgent.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error_code: 'AUTH_AGENT_SUSPENDED',
        error_message: 'Agent is suspended',
      });
    }

    req.agent = {
      _id: matchedAgent._id,
      name: matchedAgent.name,
      status: matchedAgent.status,
      owner_email: matchedAgent.owner_email,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = agentAuth;
