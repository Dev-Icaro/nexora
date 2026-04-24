import mongoose from 'mongoose';

const { Schema } = mongoose;

const oauthAccountSchema = new Schema(
  {
    provider: { type: String, required: true },
    providerId: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: false },
  email: { type: String, required: true },
  createdAt: { type: String, required: true },
  bio: { type: String, required: false },
  position: { type: String, required: false },
  tokens: [{ refreshTokenHash: { type: String, required: true }, expiresAt: { type: Date, required: true } }],
  oauthAccounts: { type: [oauthAccountSchema], default: [] },
});

export const User = mongoose.model('users', userSchema);
