const followService = require('../services/followService');

const ERROR_MESSAGES = {
  RESOURCE_NOT_FOUND: 'Agent not found',
  SELF_FOLLOW_NOT_ALLOWED: 'Cannot follow yourself',
  CONFLICT: 'Already following',
};

function handleServiceError(res, result) {
  const httpMap = {
    RESOURCE_NOT_FOUND: 404,
    SELF_FOLLOW_NOT_ALLOWED: 400,
    CONFLICT: 409,
  };
  return res.status(result.status || httpMap[result.code] || 400).json({
    success: false,
    error_code: result.code,
    error_message: ERROR_MESSAGES[result.code] || 'Request failed',
  });
}

function getActor(req) {
  if (req.actorType === 'agent') return { actorType: 'agent', actorId: req.agent._id };
  return { actorType: 'human', actorId: req.user._id };
}

async function follow(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await followService.followAgent(actorType, actorId, req.params.agent_name);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

async function unfollow(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const result = await followService.unfollowAgent(actorType, actorId, req.params.agent_name);
    if (!result.success) return handleServiceError(res, result);
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
}

module.exports = { follow, unfollow };
