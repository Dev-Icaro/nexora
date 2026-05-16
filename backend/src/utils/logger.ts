/**
 * @module logger
 * Configures and exports the application-wide Winston logger singleton.
 * Import the default export to log messages at any supported level.
 *
 * @example
 * ```typescript
 * import logger from '@/utils/logger';
 * logger.info('User registered', { userId });
 * ```
 */
import 'winston-daily-rotate-file';

import * as path from 'path';
import { addColors, createLogger, format, transports } from 'winston';

import env from '@/config/environment';
import { getTransactionId, getUserId } from '@/utils/async-context';

const logDirectory = path.resolve(__dirname, '../../logs');
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    query: 5,
    debug: 6,
    silly: 7,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'blue',
    http: 'cyan',
    verbose: 'gray',
    query: 'magenta',
    debug: 'green',
    silly: 'white',
  },
};

addColors(customLevels.colors);

const logger = createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format.errors({ stack: true }),
    format(info => ({ ...info, level: info.level.toUpperCase() }))(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, stack }) => {
      const transactionId = getTransactionId() || 'SYSTEM';
      const userId = getUserId();
      return `[${level}] - ${timestamp} - ${transactionId} - ${userId}: ${stack || message}`;
    }),
  ),
  transports: [
    new transports.DailyRotateFile({
      silent: env.LOG_SILENT,
      level: env.LOG_LEVEL,
      dirname: logDirectory,
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: false,
      maxSize: '20m',
      maxFiles: '3d',
    }),
  ],
});

if (env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      silent: env.LOG_SILENT,
      level: env.LOG_LEVEL,
      format: format.combine(
        format.errors({ stack: true }),
        format(info => ({ ...info, level: info.level.toUpperCase() }))(),
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf(({ timestamp, level, message, stack }) => {
          const transactionId = getTransactionId();
          return `[${level}] - ${timestamp} - ${transactionId} - #: ${stack || message}`;
        }),
      ),
    }),
  );
}

export default logger;
