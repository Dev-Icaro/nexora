import { model, Schema } from 'mongoose';

const mediaUploadSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  entityType: { type: String, enum: ['post', 'avatar'], required: true },
  entityId: { type: Schema.Types.ObjectId, default: null },
  status: { type: String, enum: ['pending', 'confirmed'], required: true, default: 'pending' },
  objectKey: { type: String, required: true },
  confirmedUrl: { type: String, default: null },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true, default: 0 },
  createdAt: { type: Date, required: true, default: () => new Date() },
});

mediaUploadSchema.index({ userId: 1, status: 1, createdAt: 1 });
mediaUploadSchema.index({ entityId: 1 });
mediaUploadSchema.index({ objectKey: 1 }, { unique: true });

export const MediaUpload = model('media_uploads', mediaUploadSchema);
