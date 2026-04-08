import connectDatabase from '@/config/database';

const bootstrap = async (): Promise<void> => {
  await connectDatabase();
};

bootstrap().catch(error => console.error(error));
