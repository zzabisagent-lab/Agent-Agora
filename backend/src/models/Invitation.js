const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    target_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    agent_name: {
      type: String,
      default: null,
    },
    human_role: {
      type: String,
      enum: ['viewer', 'participant', 'admin'],
      default: null,
    },
    token_hash: {
      type: String,
      required: true,
      unique: true,
    },
    invited_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'cancelled'],
      default: 'pending',
    },
    expires_at: {
      type: Date,
      required: true,
    },
    accepted_at: {
      type: Date,
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
    result_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    resend_count: {
      type: Number,
      default: 0,
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

invitationSchema.index({ email: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ target_type: 1 });
invitationSchema.index({ expires_at: 1 });

invitationSchema.pre('validate', function (next) {
  if (this.target_type === 'agent' && !this.agent_name) {
    return next(new Error('agent_name is required when target_type is "agent"'));
  }
  if (this.target_type === 'human' && !this.human_role) {
    return next(new Error('human_role is required when target_type is "human"'));
  }
  next();
});

module.exports = mongoose.model('Invitation', invitationSchema);
