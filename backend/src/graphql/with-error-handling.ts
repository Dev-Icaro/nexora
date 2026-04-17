import { AppException } from '@/exceptions';
import type { ApiResponse } from '@/types/api-reponse';
import logger from '@/utils/logger';

import type { GraphQLContext } from './context';

type Resolver<TArgs, TResult, TContext> = (parent: unknown, args: TArgs, context: TContext) => Promise<TResult>;

/**
 * Higher-order function that wraps a GraphQL resolver with centralised error handling.
 *
 * @remarks
 * When the wrapped resolver throws an {@link AppException}, `withErrorHandling` catches it and
 * returns a structured {@link ApiResponse} with the exception's HTTP status code and message.
 * Any other unexpected error is re-thrown for Apollo Server's default error pipeline.
 *
 * @typeParam TArgs - The shape of the resolver's `args` parameter.
 * @typeParam TResult - The success return type of the resolver; must extend {@link ApiResponse}.
 * @typeParam TContext - The GraphQL context type; defaults to {@link GraphQLContext}.
 *
 * @param fn - The resolver function to wrap.
 * @returns A new resolver that delegates to `fn` and handles errors uniformly.
 *
 * @example
 * ```typescript
 * someResolver: withErrorHandling(async (_, args, context) => {
 *   const item = await context.dataSources.someService.findById(args.id);
 *   if (!item) throw new NotFoundException('Item not found');
 *   return item;
 * });
 * ```
 */
export function withErrorHandling<TArgs, TResult extends ApiResponse, TContext = GraphQLContext>(
  fn: Resolver<TArgs, TResult, TContext>,
): Resolver<TArgs, TResult | ApiResponse, TContext> {
  return async (parent, args, context) => {
    try {
      return await fn(parent, args, context);
    } catch (error) {
      logger.error(error);
      if (error instanceof AppException) {
        return { code: error.statusCode, success: false, message: error.message };
      }
      throw error;
    }
  };
}
