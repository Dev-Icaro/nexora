import mongoose from 'mongoose';

const { Schema } = mongoose;

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  username: { type: String, required: true },
  body: { type: String, required: true },
  createdAt: { type: String, required: true },
});

commentSchema.index({ postId: 1, _id: -1 });

export const Comment = mongoose.model('comments', commentSchema);
