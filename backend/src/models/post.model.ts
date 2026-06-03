import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface IPostDocument {
  body?: string;
  mediaUrl?: string;
  mediaKey?: string;
  username?: string;
  likeCount?: number;
  commentCount?: number;
  user?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPostDocument>(
  {
    body: String,
    mediaUrl: String,
    mediaKey: String,
    username: String,
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPostDocument>('posts', postSchema);
export type PostDocument = ReturnType<(typeof Post)['hydrate']>;
