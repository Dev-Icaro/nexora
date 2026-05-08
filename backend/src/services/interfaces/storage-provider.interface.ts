import type { DocumentDownloadMode } from '@/types/storage';

/** Defines the contract for cloud file storage operations: presigned upload/download URL generation and file deletion. */
export interface IStorageProvider {
  /**
   * Generates a presigned POST URL and form fields for uploading a file directly to S3.
   *
   * @param storageKey - The key (path) where the file will be stored in the bucket.
   * @param options - Upload constraints: content type, max file size in bytes, and optional expiration in seconds.
   * @returns A promise resolving to an object with the presigned `url` and `fields` map to include in the POST form.
   */
  getPresignedUploadUrl(
    storageKey: string,
    options: {
      expiresIn?: number;
      contentType: string;
      maxFileSizeBytes: number;
    },
  ): Promise<{ url: string; fields: Record<string, string> }>;

  /**
   * Generates a presigned URL for reading a file from S3.
   *
   * @param storageKey - The key (path) of the file in the bucket.
   * @param expiresIn - URL lifetime in seconds. Defaults to `3600` (1 hour).
   * @param mode - Controls the `Content-Disposition` header: `DOWNLOAD` forces attachment download, `VIEW` opens inline. Defaults to `DocumentDownloadMode.DOWNLOAD`.
   * @returns A promise resolving to the presigned download URL string.
   */
  getPresignedDownloadUrl(storageKey: string, expiresIn?: number, mode?: DocumentDownloadMode): Promise<string>;

  /**
   * Permanently deletes a file from S3.
   *
   * @param storageKey - The key (path) of the file to delete.
   * @returns A promise that resolves when the delete operation completes.
   */
  deleteFile(storageKey: string): Promise<void>;

  /**
   * Returns the configured S3 bucket name.
   *
   * @returns The bucket name string from environment configuration.
   */
  getBucketName(): string;
}
