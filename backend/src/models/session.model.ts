import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface ISessionDocument {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    refreshTokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

sessionSchema.index({ refreshTokenHash: 1 }, { unique: true });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISessionDocument>('sessions', sessionSchema);
export type SessionDocument = ReturnType<(typeof Session)['hydrate']>;
