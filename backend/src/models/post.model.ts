import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface IPostDocument {
  body?: string;
  mediaUrl?: string;
  mediaKey?: string;
  username?: string;
  createdAt?: string;
  likeCount?: number;
  commentCount?: number;
  user?: Types.ObjectId;
}

const postSchema = new Schema<IPostDocument>({
  body: String,
  mediaUrl: String,
  mediaKey: String,
  username: String,
  createdAt: String,
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
});

export const Post = mongoose.model<IPostDocument>('posts', postSchema);
export type PostDocument = ReturnType<(typeof Post)['hydrate']>;
