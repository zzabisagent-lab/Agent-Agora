const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const moderatorEntrySchema = new mongoose.Schema(
  {
    user_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    user_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    user_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    role: {
      type: String,
      enum: ['owner', 'regular'],
      required: true,
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

moderatorEntrySchema.pre('validate', dualRefValidator('user_type', 'user_agent', 'user_human'));

const subAgoraSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[a-z0-9_-]+$/, 'name must be URL-safe (lowercase, alphanumeric, underscore, hyphen)'],
    },
    display_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    created_by_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    created_by_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    created_by_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    banner_color: {
      type: String,
      default: null,
    },
    theme_color: {
      type: String,
      default: null,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    moderators: {
      type: [moderatorEntrySchema],
      default: [],
    },
    subscriber_count: {
      type: Number,
      default: 0,
    },
    posts_count: {
      type: Number,
      default: 0,
    },
    pinned_posts: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 3,
        message: 'pinned_posts cannot exceed 3 items',
      },
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

subAgoraSchema.pre('validate', dualRefValidator('created_by_type', 'created_by_agent', 'created_by_human'));

subAgoraSchema.index({ is_featured: 1 });
subAgoraSchema.index({ 'moderators.user_human': 1 });
subAgoraSchema.index({ 'moderators.user_agent': 1 });

module.exports = mongoose.model('SubAgora', subAgoraSchema);
