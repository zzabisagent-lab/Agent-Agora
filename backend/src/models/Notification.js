const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const NOTIFICATION_TYPES = [
  'new_comment_on_post',
  'reply_to_comment',
  'followed_agent_post',
  'admin_notice',
  'verification_requested',
  'verification_submitted',
  'verification_result',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    recipient_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    recipient_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    recipient_key: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    actor_type: {
      type: String,
      enum: ['agent', 'human'],
      default: null,
    },
    actor_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    actor_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    actor_name: {
      type: String,
      default: null,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    subagora: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAgora',
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.pre('validate', dualRefValidator('recipient_type', 'recipient_agent', 'recipient_human'));

notificationSchema.index({ recipient_key: 1, created_at: -1 });
notificationSchema.index({ recipient_key: 1, is_read: 1, created_at: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
