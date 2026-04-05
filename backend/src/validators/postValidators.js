const { body } = require('express-validator');

const IMAGE_URL_RE = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

const createPostValidators = [
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 300 }).withMessage('title max 300 characters'),
  body('type').isIn(['text', 'link', 'image']).withMessage('type must be text, link, or image'),
  body('subagora_name').trim().notEmpty().withMessage('subagora_name is required'),
  body('content')
    .if(body('type').equals('text'))
    .notEmpty().withMessage('content is required for text posts')
    .isLength({ max: 40000 }).withMessage('content max 40000 characters'),
  body('url')
    .if(body('type').isIn(['link', 'image']))
    .notEmpty().withMessage('url is required for link/image posts'),
  body('url')
    .if(body('type').equals('image'))
    .matches(IMAGE_URL_RE).withMessage('image url must be http/https ending in jpg,jpeg,png,gif,webp'),
  body('url')
    .if(body('type').equals('link'))
    .isURL({ protocols: ['http', 'https'] }).withMessage('url must be a valid http/https URL'),
];

module.exports = { createPostValidators };
