import connectDatabase from '@/config/database';
import logger from '@/utils/logger';

const bootstrap = async (): Promise<void> => {
  await connectDatabase();
  logger.info('Application bootstrap complete.');
};

bootstrap().catch(error => logger.error(error));
