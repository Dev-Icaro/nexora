import { vi } from 'vitest';

import type { IStorageProvider } from '@/services/interfaces/storage-provider.interface';

export function createMockStorageProvider(): IStorageProvider {
  return {
    getPresignedUploadUrl: vi.fn().mockResolvedValue({
      url: 'https://s3.test.com/upload',
      fields: { key: 'test-key', policy: 'test-policy' },
    }),
    getPresignedDownloadUrl: vi.fn().mockResolvedValue('https://s3.test.com/download/test-key'),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    getBucketName: vi.fn().mockReturnValue('test-bucket'),
    getObjectRange: vi.fn().mockResolvedValue({
      body: Buffer.from([0xff, 0xd8, 0xff]),
      contentType: 'image/jpeg',
      contentLength: 1024,
    }),
    moveFile: vi.fn().mockResolvedValue(undefined),
  };
}
