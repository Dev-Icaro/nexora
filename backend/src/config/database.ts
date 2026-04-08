import mongoose from 'mongoose';

const connectDatabase = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  await mongoose.connect(uri);
};

export default connectDatabase;
