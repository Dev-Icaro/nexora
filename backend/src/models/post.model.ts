import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema({
  body: String,
  mediaUrl: String,
  username: String,
  createdAt: String,
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
});

export const Post = mongoose.model('posts', postSchema);
