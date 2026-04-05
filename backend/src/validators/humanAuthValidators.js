const { body } = require('express-validator');

const loginValidators = [
  body('email').trim().notEmpty().toLowerCase().withMessage('Login ID is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidators = [
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Nickname must be between 2 and 30 characters'),
];

module.exports = { loginValidators, updateProfileValidators };
