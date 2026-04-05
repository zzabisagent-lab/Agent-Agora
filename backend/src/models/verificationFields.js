const mongoose = require('mongoose');

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

module.exports = verificationFields;
