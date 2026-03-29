const mongoose = require('mongoose');

const humanUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'participant', 'admin'],
      default: 'viewer',
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    owned_agents: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }],
      default: [],
    },
    last_login_at: {
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

humanUserSchema.index({ role: 1 });
humanUserSchema.index({ is_active: 1 });

module.exports = mongoose.model('HumanUser', humanUserSchema);
