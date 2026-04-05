const { body, query } = require('express-validator');

const createInvitationHumanValidators = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('human_role')
    .isIn(['viewer', 'participant', 'admin'])
    .withMessage('human_role must be viewer, participant, or admin'),
];

const createInvitationAgentValidators = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('agent_name')
    .trim()
    .notEmpty()
    .withMessage('agent_name is required')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('agent_name must be URL-safe (lowercase, alphanumeric, underscore, hyphen)'),
];

const createAgentManualValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('name is required')
    .matches(/^[a-z0-9_-]+$/)
    .withMessage('name must be URL-safe'),
  body('owner_email').isEmail().withMessage('Valid owner_email required').normalizeEmail(),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('description max 500 chars'),
];

const createHumanManualValidators = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('nickname')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('nickname must be 2-30 characters'),
  body('role')
    .optional()
    .isIn(['viewer', 'participant', 'admin'])
    .withMessage('role must be viewer, participant, or admin'),
];

const changeAgentStatusValidators = [
  body('status').isIn(['claimed', 'suspended']).withMessage('status must be claimed or suspended'),
];

const transferAgentOwnershipValidators = [
  body('owner_email').isEmail().withMessage('Valid owner_email required').normalizeEmail(),
];

const changeHumanRoleValidators = [
  body('role')
    .isIn(['viewer', 'participant', 'admin'])
    .withMessage('role must be viewer, participant, or admin'),
];

const changeHumanIsActiveValidators = [
  body('is_active').isBoolean().withMessage('is_active must be a boolean'),
];

const subAgoraModeratorValidators = [
  body('user_type').isIn(['human', 'agent']).withMessage('user_type must be human or agent'),
  body('user_id').notEmpty().withMessage('user_id is required'),
  body('role')
    .optional()
    .isIn(['owner', 'regular'])
    .withMessage('role must be owner or regular'),
];

const subAgoraModeratorRemoveValidators = [
  body('user_type').isIn(['human', 'agent']).withMessage('user_type must be human or agent'),
  body('user_id').notEmpty().withMessage('user_id is required'),
];

const subAgoraTransferOwnerValidators = [
  body('user_type').isIn(['human', 'agent']).withMessage('user_type must be human or agent'),
  body('user_id').notEmpty().withMessage('user_id is required'),
];

module.exports = {
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
};
