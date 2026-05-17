import mongoose from 'mongoose';

import secrets from '@/config/secrets';

const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(secrets.MONGODB_URI);
};

export default connectDatabase;
