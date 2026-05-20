import { randomUUID } from 'crypto';
import path from 'path';

import { BadRequestException } from '@/exceptions';

/**
 * Utility for generating secure cloud storage keys
 */
export default class StorageKeyGenerator {
  private static readonly MAX_EXTENSION_LENGTH = 15;
  private static readonly MAX_KEY_LENGTH = 1024;

  /**
   * Generate a secure, unique storage key for cloud storage
   * Uses cryptographically secure UUID
   *
   * @param contractorId - The contractor ID
   * @param entityType - Type of entity ('customer' or 'process')
   * @param entityId - The entity ID
   * @param originalFilename - Original filename (for extension extraction only)
   * @returns Secure storage key in format: {contractorId}/{entityType}/{entityId}/{uuid}.{ext}
   */
  static generateKey(mediaType: 'posts' | 'profile', originalFilename: string): string {
    const uuid = randomUUID();
    const extension = this.extractSafeExtension(originalFilename);

    const key = `${mediaType}/${uuid}${extension}`;

    if (key.length > this.MAX_KEY_LENGTH) {
      throw new BadRequestException('Storage key exceeded max length');
    }

    return key;
  }

  /**
   * Generates a pending-post storage key scoped to a specific user.
   *
   * @param userId - The authenticated user's ID (embedded in the key path for ownership verification).
   * @param originalFilename - Original filename, used for extension extraction only.
   * @returns Storage key in format: `pending/posts/{userId}/{uuid}.{ext}`
   */
  static generatePendingPostKey(userId: string, originalFilename: string): string {
    const uuid = randomUUID();
    const extension = this.extractSafeExtension(originalFilename);
    const key = `pending/posts/${userId}/${uuid}${extension}`;

    if (key.length > this.MAX_KEY_LENGTH) {
      throw new BadRequestException('Storage key exceeded max length');
    }

    return key;
  }

  /**
   * Generates a pending-avatar storage key scoped to a specific user.
   *
   * @param userId - The authenticated user's ID (embedded in the key path for ownership verification).
   * @param originalFilename - Original filename, used for extension extraction only.
   * @returns Storage key in format: `pending/avatars/{userId}/{uuid}.{ext}`
   */
  static generatePendingAvatarKey(userId: string, originalFilename: string): string {
    const uuid = randomUUID();
    const extension = this.extractSafeExtension(originalFilename);
    const key = `pending/avatars/${userId}/${uuid}${extension}`;

    if (key.length > this.MAX_KEY_LENGTH) {
      throw new BadRequestException('Storage key exceeded max length');
    }

    return key;
  }

  /**
   * Generates a unique confirmed-avatar key for a user derived from the pending key's extension.
   * Each upload gets its own UUID-based key, so the URL changes on every upload and CDN cache
   * invalidation is unnecessary.
   *
   * @param userId - The authenticated user's ID.
   * @param pendingKey - The pending upload key, used only for extension extraction.
   * @returns Storage key in format: `confirmed/avatars/{userId}/{uuid}.{ext}`
   */
  static generateConfirmedAvatarKey(userId: string, pendingKey: string): string {
    const uuid = randomUUID();
    const ext = path
      .extname(pendingKey)
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '');
    return `confirmed/avatars/${userId}/${uuid}${ext}`;
  }

  /**
   * Extract and validate file extension from filename
   * Only uses the last extension to prevent tricks like "image.jpg.exe"
   * Limits extension length to prevent abuse
   *
   * @param filename - Original filename
   * @returns Safe extension with leading dot (e.g., ".jpg") or empty string
   */
  private static extractSafeExtension(filename: string): string {
    if (!filename) {
      return '';
    }

    const ext = path.extname(filename).toLowerCase();

    if (!ext || ext.length > this.MAX_EXTENSION_LENGTH || ext === '.') {
      return '';
    }

    return ext.replace(/[^a-z0-9.]/g, '');
  }
}
