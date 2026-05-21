import express from 'express';
import { GraphQLError } from 'graphql';

import logger from '@/utils/logger';

const CODE_TO_STATUS: Record<string, number> = {
  BAD_USER_INPUT: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_SERVER_ERROR: 500,
};

export default function httpErrorHandler(
  error: Error,
  req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: express.NextFunction,
) {
  logger.error(error);

  if (error instanceof GraphQLError) {
    const code = typeof error.extensions?.code === 'string' ? error.extensions.code : 'INTERNAL_SERVER_ERROR';
    const status = CODE_TO_STATUS[code] ?? 500;
    return res.status(status).json({
      status: 'error',
      message: status === 500 ? 'Internal Server Error' : error.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
}
