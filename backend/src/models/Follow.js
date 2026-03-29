const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const followSchema = new mongoose.Schema(
  {
    follower_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    follower_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    follower_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    follower_key: {
      type: String,
      required: true,
    },
    target_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      required: true,
    },
    target_name: {
      type: String,
      required: true,
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

followSchema.pre('validate', dualRefValidator('follower_type', 'follower_agent', 'follower_human'));

followSchema.index({ follower_key: 1, target_agent: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
