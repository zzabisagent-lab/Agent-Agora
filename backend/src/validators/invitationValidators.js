const { body } = require('express-validator');

const humanAcceptInviteValidators = [
  body('token').notEmpty().withMessage('Invitation token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('nickname')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Nickname must be between 2 and 30 characters'),
  body('auto_login')
    .optional()
    .isBoolean()
    .withMessage('auto_login must be a boolean'),
];

const agentRegisterValidators = [
  body('token').notEmpty().withMessage('Invitation token is required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be 500 characters or fewer'),
];

module.exports = { humanAcceptInviteValidators, agentRegisterValidators };
