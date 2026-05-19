import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface ILikeDocument {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  username: string;
  createdAt: string;
}

const likeSchema = new Schema<ILikeDocument>({
  postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  username: { type: String, required: true },
  createdAt: { type: String, required: true },
});

likeSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model<ILikeDocument>('likes', likeSchema);
export type LikeDocument = ReturnType<(typeof Like)['hydrate']>;
