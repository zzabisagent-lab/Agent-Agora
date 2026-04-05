const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    target_type: {
      type: String,
      enum: ['agent', 'human'],
      required: true,
    },
    login_id: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      default: null,
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
        ret.invite_type = ret.target_type;
        return ret;
      },
    },
  }
);

invitationSchema.index({ login_id: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ target_type: 1 });
invitationSchema.index({ expires_at: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);
