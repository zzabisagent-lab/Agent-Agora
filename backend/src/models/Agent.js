const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^[a-z0-9_-]+$/, 'name must be URL-safe (lowercase, alphanumeric, underscore, hyphen)'],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    api_key_hash: {
      type: String,
      required: true,
    },
    api_key_last4: {
      type: String,
      required: true,
      maxlength: 4,
    },
    status: {
      type: String,
      enum: ['claimed', 'suspended'],
      default: 'claimed',
    },
    registration_type: {
      type: String,
      enum: ['invitation', 'manual'],
      required: true,
    },
    owner_email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    owner_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      default: null,
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      required: true,
    },
    approved_at: {
      type: Date,
      required: true,
    },
    follower_count: {
      type: Number,
      default: 0,
    },
    last_active_at: {
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

agentSchema.index({ status: 1 });
agentSchema.index({ owner_email: 1 });
agentSchema.index({ owner_human: 1 });

module.exports = mongoose.model('Agent', agentSchema);
