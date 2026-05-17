import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import env from '@/config/environment';
import secrets from '@/config/secrets';
import { AppException } from '@/exceptions';
import { DocumentDownloadMode } from '@/types/storage';
import logger from '@/utils/logger';

import { IStorageProvider } from '../interfaces/storage-provider.interface';

export default class S3StorageProvider implements IStorageProvider {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = secrets.AWS_S3_BUCKET_NAME;

    const clientConfig: S3ClientConfig = { region: env.AWS_S3_REGION };

    if (secrets.AWS_ACCESS_KEY_ID && secrets.AWS_SECRET_ACCESS_KEY) {
      clientConfig.credentials = {
        accessKeyId: secrets.AWS_ACCESS_KEY_ID,
        secretAccessKey: secrets.AWS_SECRET_ACCESS_KEY,
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
          ['starts-with', '$key', storageKey],
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

  async getObjectRange(
    storageKey: string,
    start: number,
    end: number,
  ): Promise<{ body: Buffer; contentType: string; contentLength: number }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
        Range: `bytes=${start}-${end}`,
      });
      const response = await this.s3Client.send(command);
      const body = Buffer.from(await response.Body!.transformToByteArray());

      // ContentRange header: "bytes 0-15/12345" — extract total object size from denominator
      const totalSize = response.ContentRange ? parseInt(response.ContentRange.split('/')[1] ?? '0', 10) : 0;

      return {
        body,
        contentType: response.ContentType ?? '',
        contentLength: totalSize,
      };
    } catch (error) {
      logger.error(error);
      throw new AppException('Failed to read S3 object range', 500);
    }
  }

  async moveFile(sourceKey: string, destKey: string): Promise<void> {
    try {
      await this.s3Client.send(
        new CopyObjectCommand({
          Bucket: this.bucketName,
          CopySource: `${this.bucketName}/${sourceKey}`,
          Key: destKey,
        }),
      );
    } catch (error) {
      logger.error(error);
      throw new AppException('Failed to copy S3 object', 500);
    }

    try {
      await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: sourceKey }));
    } catch (error) {
      logger.error('Failed to delete pending S3 object after copy — will be cleaned by lifecycle policy', error);
    }
  }
}
