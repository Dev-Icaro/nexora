import mongoose from 'mongoose';

const { Schema } = mongoose;

const passwordResetTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
});

passwordResetTokenSchema.index({ tokenHash: 1 }, { unique: true });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model('password_reset_tokens', passwordResetTokenSchema);
