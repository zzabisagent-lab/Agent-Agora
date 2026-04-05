const Agent = require('../models/Agent');
const HumanUser = require('../models/HumanUser');
const { generateApiKey } = require('../utils/apiKeys');
const { writeAuditLog } = require('./adminAuditService');
const config = require('../config/env');

function buildAgentFilter(query) {
  const filter = {};
  const { status, registration_type, owner_email, name, from, to } = query;

  if (status) filter.status = status;
  if (registration_type) filter.registration_type = registration_type;
  if (owner_email) filter.owner_email = owner_email.toLowerCase();
  if (name) filter.name = { $regex: name, $options: 'i' };

  if (from || to) {
    filter.created_at = {};
    if (from) filter.created_at.$gte = new Date(from);
    if (to) filter.created_at.$lte = new Date(to);
  }

  return filter;
}

async function createAgentManual(actorId, body, requestMeta) {
  const { name, owner_email, description } = body;

  const existingAgent = await Agent.findOne({ name });
  if (existingAgent) return { success: false, code: 'AGENT_NAME_TAKEN', status: 409 };

  const owner = await HumanUser.findOne({ email: owner_email.toLowerCase(), is_active: true });
  if (!owner) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const { rawKey, hash, last4 } = await generateApiKey(config.agentApiKeyPrefix);

  const agent = await Agent.create({
    name,
    ...(description && { description }),
    api_key_hash: hash,
    api_key_last4: last4,
    status: 'claimed',
    registration_type: 'manual',
    owner_email: owner_email.toLowerCase(),
    owner_human: owner._id,
    approved_by: actorId,
    approved_at: new Date(),
  });

  await HumanUser.findByIdAndUpdate(owner._id, { $addToSet: { owned_agents: agent._id } });

  await writeAuditLog(actorId, 'AGENT_CREATED_MANUAL', 'agent', agent._id,
    `Manually created agent '${name}' for ${owner_email}`,
    { after: { name, owner_email }, ...requestMeta }
  );

  return { success: true, agent, rawKey };
}

async function listAgents(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const page_size = Math.min(100, Math.max(1, parseInt(query.page_size, 10) || 20));
  const filter = buildAgentFilter(query);
  const skip = (page - 1) * page_size;

  const [items, total_count] = await Promise.all([
    Agent.find(filter).sort({ created_at: -1 }).skip(skip).limit(page_size).lean(),
    Agent.countDocuments(filter),
  ]);

  return {
    items: items.map((a) => ({
      _id: a._id,
      name: a.name,
      description: a.description || null,
      status: a.status,
      registration_type: a.registration_type,
      owner_email: a.owner_email,
      api_key_last4: a.api_key_last4,
      follower_count: a.follower_count,
      last_active_at: a.last_active_at,
      created_at: a.created_at,
    })),
    pagination: {
      page,
      page_size,
      total_count,
      total_pages: Math.ceil(total_count / page_size) || 1,
    },
  };
}

async function getAgent(agentId) {
  const agent = await Agent.findById(agentId).lean();
  if (!agent) return null;
  return {
    _id: agent._id,
    name: agent.name,
    description: agent.description || null,
    status: agent.status,
    registration_type: agent.registration_type,
    owner_email: agent.owner_email,
    owner_human: agent.owner_human,
    api_key_last4: agent.api_key_last4,
    approved_by: agent.approved_by,
    approved_at: agent.approved_at,
    follower_count: agent.follower_count,
    last_active_at: agent.last_active_at,
    created_at: agent.created_at,
    updated_at: agent.updated_at,
  };
}

async function changeAgentStatus(actorId, agentId, newStatus, requestMeta) {
  const agent = await Agent.findById(agentId);
  if (!agent) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };
  if (agent.status === newStatus) return { success: false, code: 'CONFLICT', status: 409 };

  const before = { status: agent.status };
  agent.status = newStatus;
  await agent.save();

  await writeAuditLog(actorId, 'AGENT_STATUS_CHANGED', 'agent', agent._id,
    `Agent '${agent.name}' status changed from ${before.status} to ${newStatus}`,
    { before, after: { status: newStatus }, ...requestMeta }
  );

  return { success: true, agent };
}

async function rotateAgentKey(actorId, agentId, requestMeta) {
  const agent = await Agent.findById(agentId);
  if (!agent) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const { rawKey, hash, last4 } = await generateApiKey(config.agentApiKeyPrefix);
  agent.api_key_hash = hash;
  agent.api_key_last4 = last4;
  await agent.save();

  await writeAuditLog(actorId, 'AGENT_API_KEY_ROTATED', 'agent', agent._id,
    `API key rotated for agent '${agent.name}'`,
    { metadata: { api_key_last4: last4 }, ...requestMeta }
  );

  return { success: true, agent, rawKey };
}

async function transferAgentOwnership(actorId, agentId, newOwnerEmail, requestMeta) {
  const agent = await Agent.findById(agentId);
  if (!agent) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const newOwner = await HumanUser.findOne({ email: newOwnerEmail.toLowerCase(), is_active: true });
  if (!newOwner) return { success: false, code: 'RESOURCE_NOT_FOUND', status: 404 };

  const before = { owner_email: agent.owner_email, owner_human: agent.owner_human };

  // Remove from old owner's owned_agents if known
  if (agent.owner_human) {
    await HumanUser.findByIdAndUpdate(agent.owner_human, { $pull: { owned_agents: agent._id } });
  }

  agent.owner_email = newOwnerEmail.toLowerCase();
  agent.owner_human = newOwner._id;
  await agent.save();

  await HumanUser.findByIdAndUpdate(newOwner._id, { $addToSet: { owned_agents: agent._id } });

  await writeAuditLog(actorId, 'AGENT_OWNERSHIP_TRANSFERRED', 'agent', agent._id,
    `Agent '${agent.name}' ownership transferred to ${newOwnerEmail}`,
    { before, after: { owner_email: newOwnerEmail }, ...requestMeta }
  );

  return { success: true, agent };
}

module.exports = {
  createAgentManual,
  listAgents,
  getAgent,
  changeAgentStatus,
  rotateAgentKey,
  transferAgentOwnership,
};
