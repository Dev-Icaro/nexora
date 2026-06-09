import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface ICommentLikeDocument {
  commentId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentLikeSchema = new Schema<ICommentLikeDocument>(
  {
    commentId: { type: Schema.Types.ObjectId, ref: 'comments', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    username: { type: String, required: true },
  },
  { timestamps: true },
);

commentLikeSchema.index({ commentId: 1, userId: 1 }, { unique: true });

export const CommentLike = mongoose.model<ICommentLikeDocument>('comment_likes', commentLikeSchema);
export type CommentLikeDocument = ReturnType<(typeof CommentLike)['hydrate']>;
