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
