import { z } from 'zod';

const environmentSchema = z.object({
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\/.+/, 'MONGODB_URI must be a valid MongoDB connection string'),
});

export default environmentSchema.parse(process.env);
