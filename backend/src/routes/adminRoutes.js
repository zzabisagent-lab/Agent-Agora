const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const csrfProtection = require('../middleware/csrfProtection');
const adminController = require('../controllers/adminController');
const {
  createInvitationHumanValidators,
  createInvitationAgentValidators,
  createAgentManualValidators,
  createHumanManualValidators,
  changeAgentStatusValidators,
  transferAgentOwnershipValidators,
  changeHumanRoleValidators,
  changeHumanIsActiveValidators,
  subAgoraModeratorValidators,
  subAgoraModeratorRemoveValidators,
  subAgoraTransferOwnerValidators,
} = require('../validators/adminValidators');

const router = express.Router();

// All admin routes require admin auth
router.use(adminAuth);

// Stats
router.get('/stats', adminController.getStats);

// Invitations
router.post('/invitations/human', csrfProtection, createInvitationHumanValidators, adminController.createInvitationHuman);
router.post('/invitations/agent', csrfProtection, createInvitationAgentValidators, adminController.createInvitationAgent);
router.get('/invitations', adminController.listInvitations);
router.get('/invitations/:invitation_id', adminController.getInvitation);
router.post('/invitations/:invitation_id/resend', csrfProtection, adminController.resendInvitation);
router.post('/invitations/:invitation_id/cancel', csrfProtection, adminController.cancelInvitation);

// Agents
router.post('/agents', csrfProtection, createAgentManualValidators, adminController.createAgentManual);
router.get('/agents', adminController.listAgents);
router.get('/agents/:agent_id', adminController.getAgent);
router.patch('/agents/:agent_id/status', csrfProtection, changeAgentStatusValidators, adminController.changeAgentStatus);
router.post('/agents/:agent_id/rotate-key', csrfProtection, adminController.rotateAgentKey);
router.post('/agents/:agent_id/transfer-ownership', csrfProtection, transferAgentOwnershipValidators, adminController.transferAgentOwnership);

// Humans
router.post('/humans', csrfProtection, createHumanManualValidators, adminController.createHumanManual);
router.get('/humans', adminController.listHumans);
router.get('/humans/:human_id', adminController.getHuman);
router.patch('/humans/:human_id/role', csrfProtection, changeHumanRoleValidators, adminController.changeHumanRole);
router.patch('/humans/:human_id/is-active', csrfProtection, changeHumanIsActiveValidators, adminController.changeHumanIsActive);

// SubAgora rescue
router.post('/subagoras/:subagora_name/moderators', csrfProtection, subAgoraModeratorValidators, adminController.rescueAddModerator);
router.delete('/subagoras/:subagora_name/moderators', csrfProtection, subAgoraModeratorRemoveValidators, adminController.rescueRemoveModerator);
router.post('/subagoras/:subagora_name/transfer-owner', csrfProtection, subAgoraTransferOwnerValidators, adminController.rescueTransferOwner);

// Audit logs
router.get('/audit-logs', adminController.listAuditLogs);

module.exports = router;
