import mongoose from 'mongoose';

const { Schema } = mongoose;

const postSchema = new Schema({
  body: String,
  mediaUrl: String,
  username: String,
  createdAt: String,
  comments: [
    {
      body: String,
      userId: String,
      createdAt: String,
    },
  ],
  likes: [
    {
      userId: String,
      createdAt: String,
    },
  ],
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
});

export const Post = mongoose.model('posts', postSchema);
