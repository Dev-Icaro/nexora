import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface IEmailVerificationTokenDocument {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationTokenDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
});

emailVerificationTokenSchema.index({ tokenHash: 1 }, { unique: true });
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationToken = mongoose.model<IEmailVerificationTokenDocument>(
  'email_verification_tokens',
  emailVerificationTokenSchema,
);
export type EmailVerificationTokenDocument = ReturnType<(typeof EmailVerificationToken)['hydrate']>;
