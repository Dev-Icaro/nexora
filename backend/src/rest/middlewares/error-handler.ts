import express from 'express';

import { AppException } from '@/exceptions/app.exception';
import logger from '@/utils/logger';

export default function errorHandler(
  error: Error,
  req: express.Request,
  res: express.Response,
  _next: express.NextFunction,
) {
  logger.error(error);
  if (error instanceof AppException) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  } else {
    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
  }
}
