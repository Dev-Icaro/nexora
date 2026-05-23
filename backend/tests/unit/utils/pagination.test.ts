import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { decodeCursor, encodeCursor } from '@/utils/pagination';

describe('encodeCursor / decodeCursor', () => {
  it('round-trips a valid ObjectId string', () => {
    const id = new Types.ObjectId().toString();
    const cursor = encodeCursor(id);
    const decoded = decodeCursor(cursor);
    expect(decoded?.toString()).toBe(id);
  });

  it('encoded cursor is different from the raw id', () => {
    const id = new Types.ObjectId().toString();
    expect(encodeCursor(id)).not.toBe(id);
  });

  it('decodeCursor returns null for arbitrary garbage', () => {
    expect(decodeCursor('not-a-valid-cursor')).toBeNull();
  });

  it('decodeCursor returns null for an empty string', () => {
    expect(decodeCursor('')).toBeNull();
  });

  it('decodeCursor returns null for a non-ObjectId base64 string', () => {
    const nonObjectId = Buffer.from('hello-world').toString('base64');
    expect(decodeCursor(nonObjectId)).toBeNull();
  });
});
