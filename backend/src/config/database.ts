import mongoose from 'mongoose';

import env from '@/config/environment';

const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(env.MONGODB_URI);
};

export default connectDatabase;
