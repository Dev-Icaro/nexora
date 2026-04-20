import { unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';
import { GraphQLError } from 'graphql/error';

import { AppException } from '@/exceptions';
import logger from '@/utils/logger';

export function apolloErrorHandler(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  logger.error(formattedError.message, error);

  const originalError = unwrapResolverError(error);

  if (originalError instanceof AppException || originalError instanceof GraphQLError) {
    return {
      ...formattedError,
      message: originalError.message,
    };
  }

  return {
    ...formattedError,
    message: 'Internal server error',
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      success: false,
    },
  };
}
