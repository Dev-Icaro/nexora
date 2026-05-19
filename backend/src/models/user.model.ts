import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

interface IRefreshToken {
  refreshTokenHash: string;
  expiresAt: Date;
}

interface IOAuthAccount {
  provider: string;
  providerId: string;
}

export interface IUserDocument {
  username: string;
  password?: string;
  email: string;
  createdAt: string;
  bio?: string;
  position?: string;
  themePreference?: 'light' | 'dark' | 'system';
  tokens: IRefreshToken[];
  oauthAccounts: IOAuthAccount[];
  avatarKey?: string;
  storageUsedBytes?: number;
  storageQuotaBytes?: number;
  uploadCount?: number;
}

const oauthAccountSchema = new Schema<IOAuthAccount>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>({
  username: { type: String, required: true },
  password: { type: String, required: false },
  email: { type: String, required: true },
  createdAt: { type: String, required: true },
  bio: { type: String, required: false },
  position: { type: String, required: false },
  themePreference: { type: String, default: 'system', required: false },
  tokens: [{ refreshTokenHash: { type: String, required: true }, expiresAt: { type: Date, required: true } }],
  oauthAccounts: { type: [oauthAccountSchema], default: [] },
  avatarKey: { type: String, required: false },
  storageUsedBytes: { type: Number, default: 0 },
  storageQuotaBytes: { type: Number, default: 524_288_000 },
  uploadCount: { type: Number, default: 0 },
});

export const User = mongoose.model<IUserDocument>('users', userSchema);
export type UserDocument = ReturnType<(typeof User)['hydrate']>;
