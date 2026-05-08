import { DeleteObjectCommand, GetObjectCommand, S3Client, type S3ClientConfig } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import env from '@/config/environment';
import { AppException } from '@/exceptions';
import { DocumentDownloadMode } from '@/types/storage';
import logger from '@/utils/logger';

import { IStorageProvider } from '../interfaces/storage-provider.interface';

/** AWS S3 implementation of the storage service. */
export default class S3StorageProvider implements IStorageProvider {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = env.AWS_S3_BUCKET_NAME;

    const clientConfig: S3ClientConfig = { region: env.AWS_S3_REGION };

    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.s3Client = new S3Client(clientConfig);
  }

  async getPresignedUploadUrl(
    storageKey: string,
    options: {
      expiresIn?: number;
      contentType: string;
      maxFileSizeBytes: number;
    },
  ): Promise<{ url: string; fields: Record<string, string> }> {
    try {
      const { expiresIn = 900, contentType, maxFileSizeBytes } = options;
      const presignedPost = await createPresignedPost(this.s3Client, {
        Bucket: this.bucketName,
        Key: storageKey,
        Expires: expiresIn,
        Fields: {
          'Content-Type': contentType,
        },
        Conditions: [
          ['content-length-range', 1, maxFileSizeBytes],
          ['eq', '$Content-Type', contentType],
        ],
      });

      return {
        url: presignedPost.url,
        fields: presignedPost.fields,
      };
    } catch (error) {
      logger.error(error);
      throw new AppException('Failed to generate S3 upload URL', 500);
    }
  }

  async getPresignedDownloadUrl(
    storageKey: string,
    expiresIn: number = 3600,
    mode: DocumentDownloadMode = DocumentDownloadMode.DOWNLOAD,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        ResponseContentDisposition: mode === DocumentDownloadMode.VIEW ? 'inline' : 'attachment',
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error(error);
      throw new AppException('Failed to generate S3 download URL', 500);
    }
  }

  async deleteFile(storageKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      await this.s3Client.send(command);
    } catch (error) {
      logger.error(error);
      throw new AppException('Failed to delete file from S3', 500);
    }
  }

  getBucketName(): string {
    return this.bucketName;
  }
}
