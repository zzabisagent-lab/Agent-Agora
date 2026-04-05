const Follow = require('../models/Follow');
const Agent = require('../models/Agent');

async function followAgent(followerType, followerId, agentName) {
  const agent = await Agent.findOne({ name: agentName });
  if (!agent) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  // Self-follow check: agent can't follow itself
  if (followerType === 'agent' && followerId.toString() === agent._id.toString()) {
    return { success: false, code: 'SELF_FOLLOW_NOT_ALLOWED', status: 400 };
  }

  const followerKey = `${followerType}:${followerId}`;
  const existing = await Follow.findOne({ follower_key: followerKey, target_agent: agent._id });
  if (existing) return { success: false, code: 'CONFLICT', status: 409 };

  const followerField = followerType === 'human' ? 'follower_human' : 'follower_agent';

  await Follow.create({
    follower_type: followerType,
    [followerField]: followerId,
    follower_key: followerKey,
    target_agent: agent._id,
    target_name: agentName,
  });

  await Agent.findByIdAndUpdate(agent._id, { $inc: { follower_count: 1 } });

  return { success: true };
}

async function unfollowAgent(followerType, followerId, agentName) {
  const agent = await Agent.findOne({ name: agentName });
  if (!agent) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const followerKey = `${followerType}:${followerId}`;
  const deleted = await Follow.findOneAndDelete({ follower_key: followerKey, target_agent: agent._id });
  if (!deleted) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  await Agent.findByIdAndUpdate(agent._id, { $inc: { follower_count: -1 } });

  return { success: true };
}

async function getFollowedAgentIds(followerType, followerId) {
  const followerKey = `${followerType}:${followerId}`;
  const follows = await Follow.find({ follower_key: followerKey }).select('target_agent').lean();
  return follows.map((f) => f.target_agent);
}

module.exports = { followAgent, unfollowAgent, getFollowedAgentIds };
