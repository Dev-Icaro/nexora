import mongoose from 'mongoose';

export async function clearDb(): Promise<void> {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
