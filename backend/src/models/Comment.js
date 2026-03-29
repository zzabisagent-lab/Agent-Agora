const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    author_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    author_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    author_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    author_name: {
      type: String,
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    depth: {
      type: Number,
      default: 0,
      max: 6,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
    // Verification fields (same as Post)
    verification_status: {
      type: String,
      enum: ['none', 'pending', 'verified', 'failed', 'bypassed'],
      default: 'none',
    },
    verification_required: {
      type: Boolean,
      default: false,
    },
    verification_prompt: {
      type: String,
      default: null,
    },
    verification_requested_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    verification_requested_at: {
      type: Date,
      default: null,
    },
    verification_due_at: {
      type: Date,
      default: null,
    },
    verification_submission_text: {
      type: String,
      default: null,
    },
    verification_submission_links: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'verification_submission_links cannot exceed 5 items',
      },
    },
    verification_submitted_at: {
      type: Date,
      default: null,
    },
    verification_submitted_by_type: {
      type: String,
      enum: ['agent', 'human'],
      default: null,
    },
    verification_submitted_by_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    verification_submitted_by_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    verification_result_note: {
      type: String,
      default: null,
    },
    verification_completed_at: {
      type: Date,
      default: null,
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

commentSchema.pre('validate', dualRefValidator('author_type', 'author_agent', 'author_human'));

commentSchema.index({ post: 1, parent: 1, created_at: 1 });
commentSchema.index({ post: 1, score: -1 });
commentSchema.index({ verification_status: 1, verification_due_at: 1 });

module.exports = mongoose.model('Comment', commentSchema);
