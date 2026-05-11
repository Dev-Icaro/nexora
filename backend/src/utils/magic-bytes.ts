import settings from '@/config/settings';
import { BadRequestException } from '@/exceptions';

/** Number of bytes fetched from S3 for magic-byte validation. */
export const MAGIC_BYTES_HEADER_LENGTH = 16;

type MagicBytesSpec = {
  offset: number;
  hex: string;
};

const MAGIC_BYTES: Record<string, MagicBytesSpec[]> = {
  'image/jpeg': [{ offset: 0, hex: 'ffd8ff' }],
  'image/png': [{ offset: 0, hex: '89504e47' }],
  'image/gif': [{ offset: 0, hex: '47494638' }],
  'image/webp': [{ offset: 0, hex: '52494646' }],
  'video/mp4': [{ offset: 4, hex: '66747970' }],
  'video/webm': [{ offset: 0, hex: '1a45dfa3' }],
};

/** MIME types accepted by the upload pipeline. */
export const ALLOWED_CONTENT_TYPES = new Set(Object.keys(MAGIC_BYTES));

/**
 * Validates that the actual bytes of an uploaded file match its stored MIME type.
 * Bytes are read directly from S3 — never from client-supplied data.
 *
 * @param contentType - The MIME type stored in S3 (set by the presigned POST policy).
 * @param headerBuffer - The first {@link MAGIC_BYTES_HEADER_LENGTH} bytes of the file.
 * @throws {BadRequestException} If `contentType` is not in the allow-list or the bytes do not match.
 */
export function validateMagicBytes(contentType: string, headerBuffer: Buffer): void {
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    throw new BadRequestException(`Unsupported content type: ${contentType}`);
  }

  const specs = MAGIC_BYTES[contentType]!;

  for (const { offset, hex } of specs) {
    const sigBytes = hex.length / 2;
    const slice = headerBuffer.subarray(offset, offset + sigBytes);
    if (slice.toString('hex') !== hex) {
      throw new BadRequestException(`File content does not match declared content type ${contentType}`);
    }
  }
}

/**
 * Returns the maximum allowed file size in bytes for a given MIME type.
 *
 * @param contentType - A validated MIME type string.
 * @returns Size limit in bytes from {@link settings}: `VIDEO_FILE_SIZE_LIMIT_BYTES` or `IMAGE_FILE_SIZE_LIMIT_BYTES`.
 */
export function getFileSizeLimit(contentType: string): number {
  return contentType.startsWith('video/') ? settings.VIDEO_FILE_SIZE_LIMIT_BYTES : settings.IMAGE_FILE_SIZE_LIMIT_BYTES;
}
