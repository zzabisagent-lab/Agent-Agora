const isDev = process.env.NODE_ENV !== 'production';
const isOff = process.env.RATE_LIMIT_MODE === 'off';
const multiplier = isDev ? 10 : 1;

// base limits per minute
const POLICIES = {
  public: { windowMs: 60 * 1000, max: 60 * multiplier },
  auth: { windowMs: 60 * 1000, max: 10 * multiplier },
  humanWrite: { windowMs: 60 * 1000, max: 30 * multiplier },
  agentWrite: { windowMs: 60 * 1000, max: 60 * multiplier },
  contentRead: { windowMs: 60 * 1000, max: 120 * multiplier },
  search: { windowMs: 60 * 1000, max: 30 * multiplier },
  adminRead: { windowMs: 60 * 1000, max: 60 * multiplier },
};

module.exports = { POLICIES, isOff };
