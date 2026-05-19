/** Controls how a presigned download URL instructs the browser to handle the file. */
export enum DocumentDownloadMode {
  /** Triggers a file download via `Content-Disposition: attachment`. */
  DOWNLOAD = 'download',
  /** Opens the file inline in the browser via `Content-Disposition: inline`. */
  VIEW = 'view',
}

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

  /**
   * Fetches a byte range from an S3 object and returns the body together with object metadata.
   * Use this instead of HeadObject when you need both the file content and its attributes.
   *
   * @param storageKey - The key (path) of the object in the bucket.
   * @param start - First byte offset (inclusive).
   * @param end - Last byte offset (inclusive).
   * @returns A promise resolving to the raw bytes, the object's content type, and its total size in bytes.
   * @throws {AppException} If the object does not exist or the S3 call fails.
   */
  getObjectRange(
    storageKey: string,
    start: number,
    end: number,
  ): Promise<{ body: Buffer; contentType: string; contentLength: number }>;

  /**
   * Copies an S3 object to a new key then deletes the source (atomic move).
   *
   * @param sourceKey - The key of the object to move.
   * @param destKey - The destination key.
   * @returns A promise that resolves when the move is complete.
   * @throws {AppException} If the copy operation fails.
   */
  moveFile(sourceKey: string, destKey: string): Promise<void>;
}
