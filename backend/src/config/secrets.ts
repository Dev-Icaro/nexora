import * as fs from 'node:fs';

import { z } from 'zod';

function readSecret(filePathEnvVar: string): string | undefined {
  const filePath = process.env[filePathEnvVar];
  if (!filePath) return undefined;

  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    throw new Error(
      `Failed to read secret from "${filePath}" (${filePathEnvVar}): ${err instanceof Error ? err.message : String(err)}`,
      { cause: err },
    );
  }
}

const secretsSchema = z.object({
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, 'MONGODB_URI must be a valid MongoDB connection string'),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_S3_BUCKET_NAME: z.string().min(1),
  AWS_CLOUDFRONT_KEY_PAIR_ID: z.string().min(1),
  AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME: z.string().min(1),
  AWS_CLOUDFRONT_DISTRIBUTION_ID: z.string().min(1),
});

export default secretsSchema.parse({
  ACCESS_TOKEN_SECRET: readSecret('APP_ACCESS_TOKEN_FILE'),
  REFRESH_TOKEN_SECRET: readSecret('APP_REFRESH_TOKEN_FILE'),
  MONGODB_URI: readSecret('MONGODB_URI_FILE'),
  GITHUB_CLIENT_ID: readSecret('GITHUB_CLIENT_ID_FILE'),
  GITHUB_CLIENT_SECRET: readSecret('GITHUB_CLIENT_SECRET_FILE'),
  GOOGLE_CLIENT_ID: readSecret('GOOGLE_CLIENT_ID_FILE'),
  GOOGLE_CLIENT_SECRET: readSecret('GOOGLE_CLIENT_SECRET_FILE'),
  RESEND_API_KEY: readSecret('RESEND_API_KEY_FILE'),
  AWS_ACCESS_KEY_ID: readSecret('AWS_ACCESS_KEY_ID_FILE'),
  AWS_SECRET_ACCESS_KEY: readSecret('AWS_SECRET_ACCESS_KEY_FILE'),
  AWS_S3_BUCKET_NAME: readSecret('AWS_S3_BUCKET_NAME_FILE'),
  AWS_CLOUDFRONT_KEY_PAIR_ID: readSecret('AWS_CLOUDFRONT_KEY_PAIR_ID_FILE'),
  AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME: readSecret('AWS_CLOUDFRONT_PRIVATE_KEY_SECRET_NAME_FILE'),
  AWS_CLOUDFRONT_DISTRIBUTION_ID: readSecret('AWS_CLOUDFRONT_DISTRIBUTION_ID_FILE'),
});
