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
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
});

export default secretsSchema.parse({
  ACCESS_TOKEN_SECRET: readSecret('APP_ACCESS_TOKEN_FILE'),
  REFRESH_TOKEN_SECRET: readSecret('APP_REFRESH_TOKEN_FILE'),
  AWS_ACCESS_KEY_ID: readSecret('AWS_ACCESS_KEY_ID_FILE'),
  AWS_SECRET_ACCESS_KEY: readSecret('AWS_SECRET_ACCESS_KEY_FILE'),
});
