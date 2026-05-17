import mongoose from 'mongoose';

import env from '@/config/environment';
import secrets from '@/config/secrets';

const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI, { pass: secrets.DB_PASSWORD });
};

export default connectDatabase;
