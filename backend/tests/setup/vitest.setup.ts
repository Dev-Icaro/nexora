import mongoose from 'mongoose';
import { afterAll, beforeAll, vi } from 'vitest';

vi.mock('@/config/secrets', () => ({
  default: {
    ACCESS_TOKEN_SECRET: 'test-access-secret-at-least-32-chars!!',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret-at-least-32-chars!',
    MONGODB_URI: 'mongodb://127.0.0.1:27017/test',
    GITHUB_CLIENT_ID: 'test-github-id',
    GITHUB_CLIENT_SECRET: 'test-github-secret',
    GOOGLE_CLIENT_ID: 'test-google-id',
    GOOGLE_CLIENT_SECRET: 'test-google-secret',
    RESEND_API_KEY: 'test-resend-key',
    AWS_S3_BUCKET_NAME: 'test-bucket',
    AWS_CLOUDFRONT_KEY_PAIR_ID: 'test-key-pair',
    AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME: 'test-private-key',
    AWS_CLOUDFRONT_DISTRIBUTION_ID: 'test-dist-id',
  },
}));

vi.mock('@/services/cloud/cloud-front', () => ({
  signMediaUrl: vi.fn().mockResolvedValue('https://cdn.nexora.test/signed-key'),
}));

beforeAll(async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env['TEST_MONGODB_URI']!);
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
});
