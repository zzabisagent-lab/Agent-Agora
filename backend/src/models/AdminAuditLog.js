const mongoose = require('mongoose');

const ADMIN_ACTIONS = [
  'INVITATION_CREATED',
  'INVITATION_RESENT',
  'INVITATION_CANCELLED',
  'AGENT_CREATED_MANUAL',
  'HUMAN_CREATED_MANUAL',
  'AGENT_STATUS_CHANGED',
  'AGENT_API_KEY_ROTATED',
  'AGENT_OWNERSHIP_TRANSFERRED',
  'HUMAN_ROLE_CHANGED',
  'HUMAN_ACTIVE_CHANGED',
  'SUBAGORA_MODERATOR_RESCUED',
  'SUBAGORA_OWNER_TRANSFERRED',
];

const adminAuditLogSchema = new mongoose.Schema(
  {
    actor_human: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HumanUser',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ADMIN_ACTIONS,
    },
    target_type: {
      type: String,
      enum: ['invitation', 'agent', 'human', 'subagora'],
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    summary: {
      type: String,
      required: true,
    },
    before_json: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    after_json: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ip_address: {
      type: String,
      default: null,
    },
    user_agent: {
      type: String,
      default: null,
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

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
