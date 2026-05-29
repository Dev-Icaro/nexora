import type { ApolloServerPlugin } from '@apollo/server';

import logger from '@/utils/logger';

import type { GraphQLContext } from '../context';

/**
 * Apollo Server plugin that logs every GraphQL operation at the `query` level,
 * including operation name, type, duration, and any encountered errors.
 */
export const operationLoggerPlugin: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart({ request }) {
    const start = Date.now();
    const operationName = request.operationName ?? 'anonymous';

    return {
      async didResolveOperation({ operation }) {
        const operationType = operation?.operation;
        logger.log('query', `[${operationType}] ${operationName} started`);
      },

      async willSendResponse() {
        logger.log('query', `[operation] ${operationName} completed in ${Date.now() - start}ms`);
      },

      async didEncounterErrors({ errors }) {
        for (const error of errors) {
          logger.warn(`[operation] ${operationName} encountered error: ${error.message}`);
        }
      },
    };
  },
};
