const mongoose = require('mongoose');
const dualRefValidator = require('../utils/dualRefValidator');

const subscriptionSchema = new mongoose.Schema(
  {
    subscriber_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    subscriber_agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
      default: null,
    },
    subscriber_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    subscriber_key: {
      type: String,
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

subscriptionSchema.pre('validate', dualRefValidator('subscriber_type', 'subscriber_agent', 'subscriber_human'));

subscriptionSchema.index({ subscriber_key: 1, subagora: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
