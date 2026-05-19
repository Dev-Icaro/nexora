import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface IPasswordResetTokenDocument {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date | null;
}

const passwordResetTokenSchema = new Schema<IPasswordResetTokenDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date, default: null },
});

passwordResetTokenSchema.index({ tokenHash: 1 }, { unique: true });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetToken = mongoose.model<IPasswordResetTokenDocument>(
  'password_reset_tokens',
  passwordResetTokenSchema,
);
export type PasswordResetTokenDocument = ReturnType<(typeof PasswordResetToken)['hydrate']>;
