import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: String, required: true },
  tokens: [{ refreshTokenHash: { type: String, required: true }, expiresAt: { type: Date, required: true } }],
});

export const User = mongoose.model('users', userSchema);
