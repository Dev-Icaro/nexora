import mongoose from 'mongoose';

const { Schema } = mongoose;

const likeSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  username: { type: String, required: true },
  createdAt: { type: String, required: true },
});

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model('likes', likeSchema);
