import { Types } from 'mongoose';

/**
 * Encodes a MongoDB ObjectId string into an opaque base64 cursor.
 *
 * @param id - Raw ObjectId string to encode.
 * @returns Opaque base64-encoded cursor string safe to expose to clients.
 */
export const encodeCursor = (id: string): string => Buffer.from(id).toString('base64');

/**
 * Decodes an opaque base64 cursor back to a Mongoose ObjectId.
 *
 * @param cursor - Base64-encoded cursor received from the client.
 * @returns Parsed ObjectId, or `null` if the cursor is missing or invalid.
 */
export const decodeCursor = (cursor: string): Types.ObjectId | null => {
  try {
    const raw = Buffer.from(cursor, 'base64').toString('utf8');
    return new Types.ObjectId(raw);
  } catch {
    return null;
  }
};
