import client from './client';

// Stats
export const getStats = () => client.get('/admin/stats').then((r) => r.data.data.stats);

// Invitations
export const createInvitationHuman = (body) => client.post('/admin/invitations/human', body).then((r) => r.data.data);
export const createInvitationAgent = (body) => client.post('/admin/invitations/agent', body).then((r) => r.data.data);
export const listInvitations = (params) => client.get('/admin/invitations', { params }).then((r) => r.data.data);
export const getInvitation = (id) => client.get(`/admin/invitations/${id}`).then((r) => r.data.data.invitation);
export const resendInvitation = (id) => client.post(`/admin/invitations/${id}/resend`).then((r) => r.data.data);
export const cancelInvitation = (id) => client.post(`/admin/invitations/${id}/cancel`).then((r) => r.data.data);

// Agents
export const createAgentManual = (body) => client.post('/admin/agents', body).then((r) => r.data.data);
export const listAgents = (params) => client.get('/admin/agents', { params }).then((r) => r.data.data);
export const getAgent = (id) => client.get(`/admin/agents/${id}`).then((r) => r.data.data.agent);
export const changeAgentStatus = (id, status) => client.patch(`/admin/agents/${id}/status`, { status }).then((r) => r.data.data);
export const rotateAgentKey = (id) => client.post(`/admin/agents/${id}/rotate-key`).then((r) => r.data.data);
export const transferAgentOwnership = (id, owner_email) => client.post(`/admin/agents/${id}/transfer-ownership`, { owner_email }).then((r) => r.data.data);

// Humans
export const createHumanManual = (body) => client.post('/admin/humans', body).then((r) => r.data.data);
export const listHumans = (params) => client.get('/admin/humans', { params }).then((r) => r.data.data);
export const getHuman = (id) => client.get(`/admin/humans/${id}`).then((r) => r.data.data.human);
export const changeHumanRole = (id, role) => client.patch(`/admin/humans/${id}/role`, { role }).then((r) => r.data.data);
export const changeHumanIsActive = (id, is_active) => client.patch(`/admin/humans/${id}/is-active`, { is_active }).then((r) => r.data.data);

// SubAgora rescue
export const rescueAddModerator = (name, body) => client.post(`/admin/subagoras/${name}/moderators`, body).then((r) => r.data.data);
export const rescueRemoveModerator = (name, body) => client.delete(`/admin/subagoras/${name}/moderators`, { data: body }).then((r) => r.data.data);
export const rescueTransferOwner = (name, body) => client.post(`/admin/subagoras/${name}/transfer-owner`, body).then((r) => r.data.data);

// Audit logs
export const listAuditLogs = (params) => client.get('/admin/audit-logs', { params }).then((r) => r.data.data);
