import { unwrapResolverError } from '@apollo/server/errors';
import type { GraphQLFormattedError } from 'graphql';
import { GraphQLError } from 'graphql/error';

import logger from '@/utils/logger';

export function apolloErrorHandler(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const originalError = unwrapResolverError(error);

  if (originalError instanceof GraphQLError) {
    return formattedError;
  }

  logger.error('Unhandled error', error);
  return {
    message: 'Internal server error',
    extensions: { code: 'INTERNAL_SERVER_ERROR' },
  };
}
