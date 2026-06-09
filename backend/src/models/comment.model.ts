import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface ICommentDocument {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  body: string;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    username: { type: String, required: true },
    body: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

commentSchema.index({ postId: 1, _id: -1 });

export const Comment = mongoose.model<ICommentDocument>('comments', commentSchema);
export type CommentDocument = ReturnType<(typeof Comment)['hydrate']>;
