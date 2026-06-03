import { model, Schema, type Types } from 'mongoose';

export interface IMediaUploadDocument {
  userId: Types.ObjectId;
  entityType: 'post' | 'avatar';
  entityId?: Types.ObjectId | null;
  status: 'pending' | 'confirmed';
  objectKey: string;
  confirmedUrl?: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

const mediaUploadSchema = new Schema<IMediaUploadDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    entityType: { type: String, enum: ['post', 'avatar'], required: true },
    entityId: { type: Schema.Types.ObjectId, default: null },
    status: { type: String, enum: ['pending', 'confirmed'], required: true, default: 'pending' },
    objectKey: { type: String, required: true },
    confirmedUrl: { type: String, default: null },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

mediaUploadSchema.index({ userId: 1, status: 1, createdAt: 1 });
mediaUploadSchema.index({ entityId: 1 });
mediaUploadSchema.index({ objectKey: 1 }, { unique: true });

export const MediaUpload = model<IMediaUploadDocument>('media_uploads', mediaUploadSchema);
export type MediaUploadDocument = ReturnType<(typeof MediaUpload)['hydrate']>;
