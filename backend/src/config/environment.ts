import { z } from 'zod';

const environmentSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, 'MONGODB_URI must be a valid MongoDB connection string'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_PORT: z.string().default('4000').transform(Number),
  LOG_LEVEL: z.string().default('info'),
  LOG_SILENT: z
    .string()
    .default('false')
    .transform(v => v === 'true'),
  CORS_ORIGIN: z
    .string()
    // eslint-disable-next-line sonarjs/no-clear-text-protocols
    .default('http://localhost:5173,https://studio.apollographql.com')
    .transform(v => v.split(',').map(s => s.trim())),
  APP_ACCESS_TOKEN_FILE: z.string().min(1),
  APP_REFRESH_TOKEN_FILE: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  BACKEND_URL: z.string().url().default('http://localhost:4000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  RESEND_API_KEY: z.string().min(1),
  APP_EMAIL: z.string().email(),
  AWS_S3_REGION: z.string().min(1),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_ACCESS_KEY_ID_FILE: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY_FILE: z.string().min(1).optional(),
  AWS_CLOUDFRONT_DOMAIN: z.string().url(),
  AWS_CLOUDFRONT_KEY_PAIR_ID: z.string().min(1),
  AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME: z.string().min(1),
  AWS_CLOUDFRONT_REGION: z.string().min(1),
  AWS_CLOUDFRONT_DISTRIBUTION_ID: z.string().min(1),
});

export default environmentSchema.parse(process.env);
