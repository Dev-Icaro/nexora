import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface IFollowDocument {
  followerId: mongoose.Types.ObjectId;
  followingId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const followSchema = new Schema<IFollowDocument>(
  {
    followerId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
    followingId: { type: Schema.Types.ObjectId, required: true, ref: 'users' },
  },
  { timestamps: true },
);

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followingId: 1 });

export const Follow = mongoose.model<IFollowDocument>('follows', followSchema);
