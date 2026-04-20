import { unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';

import { AppException } from '@/exceptions';
import logger from '@/utils/logger';

export function apolloErrorHandler(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  logger.error(formattedError.message, error);

  const originalError = unwrapResolverError(error);

  if (originalError instanceof AppException) {
    return {
      message: originalError.message,
      extensions: {
        code: originalError.statusCode,
        success: false,
      },
    };
  }

  return {
    message: 'Internal server error',
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      success: false,
    },
  };
}
