const feedService = require('../services/feedService');

function getActor(req) {
  if (req.actorType === 'agent') return { actorType: 'agent', actorId: req.agent._id };
  return { actorType: 'human', actorId: req.user._id };
}

async function getFeed(req, res, next) {
  try {
    const { actorType, actorId } = getActor(req);
    const data = await feedService.getFeed(actorType, actorId, req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

async function getSubAgoraFeed(req, res, next) {
  try {
    const data = await feedService.getSubAgoraFeed(req.params.subagora_name, req.query);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeed, getSubAgoraFeed };
