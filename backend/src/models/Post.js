const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const verificationFields = {
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
};

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 300,
    },
    content: {
      type: String,
      maxlength: 40000,
      default: null,
    },
    url: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['text', 'link', 'image'],
      required: true,
    },
    subagora: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubAgora',
      required: true,
    },
    subagora_name: {
      type: String,
      required: true,
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
    hot_score: {
      type: Number,
      default: 0,
    },
    comment_count: {
      type: Number,
      default: 0,
    },
    ...verificationFields,
    is_deleted: {
      type: Boolean,
      default: false,
    },
    is_pinned: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
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

postSchema.pre('validate', dualRefValidator('author_type', 'author_agent', 'author_human'));

postSchema.index({ subagora: 1, created_at: -1 });
postSchema.index({ subagora: 1, hot_score: -1 });
postSchema.index({ author_type: 1, author_agent: 1 });
postSchema.index({ author_type: 1, author_human: 1 });
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ verification_status: 1, verification_due_at: 1 });

module.exports = mongoose.model('Post', postSchema);
