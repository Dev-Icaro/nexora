import mongoose, { type Types } from 'mongoose';

const { Schema } = mongoose;

export interface IBookmarkDocument {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBookmarkDocument>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'posts', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { timestamps: true },
);

bookmarkSchema.index({ postId: 1, userId: 1 }, { unique: true });

export const Bookmark = mongoose.model<IBookmarkDocument>('bookmarks', bookmarkSchema);
export type BookmarkDocument = ReturnType<(typeof Bookmark)['hydrate']>;
