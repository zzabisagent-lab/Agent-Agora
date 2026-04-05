const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const voteSchema = new mongoose.Schema(
  {
    target_type: {
      type: String,
      enum: ['post', 'comment'],
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    voter_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    voter_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    voter_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    voter_key: {
      type: String,
      required: true,
    },
    direction: {
      type: Number,
      enum: [1, -1],
      required: true,
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

voteSchema.pre('validate', dualRefValidator('voter_type', 'voter_agent', 'voter_human'));

voteSchema.index({ target_type: 1, target_id: 1, voter_key: 1 }, { unique: true });
voteSchema.index({ target_id: 1, direction: 1 });

module.exports = mongoose.model('Vote', voteSchema);
