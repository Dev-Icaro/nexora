import mongoose from 'mongoose';

const { Schema } = mongoose;

interface IOAuthAccount {
  provider: string;
  providerId: string;
}

export interface IUserDocument {
  username: string;
  password?: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  bio?: string;
  position?: string;
  themePreference?: 'light' | 'dark' | 'system';
  oauthAccounts: IOAuthAccount[];
  avatarKey?: string;
  storageUsedBytes?: number;
  storageQuotaBytes?: number;
  uploadCount?: number;
  followersCount?: number;
  followingCount?: number;
  postCount?: number;
}

const oauthAccountSchema = new Schema<IOAuthAccount>(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new Schema<IUserDocument>(
  {
    username: { type: String, required: true },
    password: { type: String, required: false },
    email: { type: String, required: true },
    emailVerified: { type: Boolean, default: false, required: true },
    bio: { type: String, required: false },
    position: { type: String, required: false },
    themePreference: { type: String, default: 'system', required: false },
    oauthAccounts: { type: [oauthAccountSchema], default: [] },
    avatarKey: { type: String, required: false },
    storageUsedBytes: { type: Number, default: 0 },
    storageQuotaBytes: { type: Number, default: 20 * 1024 * 1024 },
    uploadCount: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUserDocument>('users', userSchema);
export type UserDocument = ReturnType<(typeof User)['hydrate']>;
