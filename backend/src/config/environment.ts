import { z } from 'zod';

const environmentSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, 'MONGODB_URI must be a valid MongoDB connection string'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.string().default('info'),
  LOG_SILENT: z
    .string()
    .default('false')
    .transform(v => v === 'true'),
});

export default environmentSchema.parse(process.env);
