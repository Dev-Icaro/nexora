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
  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),
});

export default environmentSchema.parse(process.env);
