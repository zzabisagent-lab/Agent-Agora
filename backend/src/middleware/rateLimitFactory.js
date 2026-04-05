const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
const { POLICIES, isOff } = require('../config/rateLimitPolicies');

// No-op middleware for dev off mode
const noop = (_req, _res, next) => next();

function keyByActorOrIp(req) {
  // Use authenticated actor id if available, else IP
  if (req.user) return `human:${req.user._id}`;
  if (req.agent) return `agent:${req.agent._id}`;
  return ipKeyGenerator(req);
}

function keyByUserId(req) {
  if (req.user) return `human:${req.user._id}`;
  return ipKeyGenerator(req);
}

function keyByAgentId(req) {
  if (req.agent) return `agent:${req.agent._id}`;
  return ipKeyGenerator(req);
}

function make429Handler(windowMs) {
  return (req, res) => {
    const retryAfter = Math.ceil(windowMs / 1000);
    res.set('Retry-After', retryAfter);
    res.set('X-RateLimit-Remaining', '0');
    res.status(429).json({
      success: false,
      error_code: 'RATE_LIMITED',
      error_message: 'Too many requests. Please try again later.',
    });
  };
}

function createLimiter(policyKey, keyGenerator) {
  if (isOff) return noop;
  const policy = POLICIES[policyKey];
  if (!policy) throw new Error(`Unknown rate limit policy: ${policyKey}`);

  return rateLimit({
    windowMs: policy.windowMs,
    max: policy.max,
    standardHeaders: true, // Return RateLimit-* headers
    legacyHeaders: false,
    keyGenerator: keyGenerator || ipKeyGenerator,
    handler: make429Handler(policy.windowMs),
    validate: { keyGeneratorIpFallback: false },
  });
}

// Exported limiters
const publicLimiter = createLimiter('public');
const authLimiter = createLimiter('auth');
const humanWriteLimiter = createLimiter('humanWrite', keyByUserId);
const agentWriteLimiter = createLimiter('agentWrite', keyByAgentId);
const contentReadLimiter = createLimiter('contentRead', keyByActorOrIp);
const searchLimiter = createLimiter('search', keyByActorOrIp);
const adminReadLimiter = createLimiter('adminRead', keyByUserId);

/**
 * Smart write limiter: routes that accept both human and agent.
 * Applies humanWriteLimiter for humans, agentWriteLimiter for agents.
 */
function sharedWriteLimiter(req, res, next) {
  if (isOff) return next();
  if (req.actorType === 'agent' || (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))) {
    return agentWriteLimiter(req, res, next);
  }
  return humanWriteLimiter(req, res, next);
}

module.exports = {
  publicLimiter,
  authLimiter,
  humanWriteLimiter,
  agentWriteLimiter,
  contentReadLimiter,
  searchLimiter,
  adminReadLimiter,
  sharedWriteLimiter,
};
