import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    globalSetup: './tests/setup/global-setup.ts',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    pool: 'forks',
    maxWorkers: 1,
    env: {
      NODE_ENV: 'test',
      APP_PORT: '0',
      LOG_LEVEL: 'error',
      LOG_SILENT: 'true',
      MONGODB_URI_FILE: 'test',
      DB_PASSWORD_FILE: 'test',
      APP_ACCESS_TOKEN_FILE: 'test',
      APP_REFRESH_TOKEN_FILE: 'test',
      GITHUB_CLIENT_ID_FILE: 'test',
      GITHUB_CLIENT_SECRET_FILE: 'test',
      GOOGLE_CLIENT_ID_FILE: 'test',
      GOOGLE_CLIENT_SECRET_FILE: 'test',
      RESEND_API_KEY_FILE: 'test',
      APP_EMAIL: 'test@nexora.test',
      AWS_S3_REGION: 'us-east-1',
      AWS_S3_BUCKET_NAME_FILE: 'test',
      AWS_CLOUDFRONT_DOMAIN: 'https://cdn.nexora.test',
      AWS_CLOUDFRONT_KEY_PAIR_ID_FILE: 'test',
      AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME_FILE: 'test',
      AWS_CLOUDFRONT_REGION: 'us-east-1',
      AWS_CLOUDFRONT_DISTRIBUTION_ID_FILE: 'test',
    },
  },
});
