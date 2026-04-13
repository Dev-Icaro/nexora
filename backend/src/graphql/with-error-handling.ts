import { AppException } from '@/exceptions';
import type { ApiResponse } from '@/types/api-reponse';

import type { GraphQLContext } from './context';

type Resolver<TArgs, TResult, TContext> = (parent: unknown, args: TArgs, context: TContext) => Promise<TResult>;

export function withErrorHandling<TArgs, TResult extends ApiResponse, TContext = GraphQLContext>(
  fn: Resolver<TArgs, TResult, TContext>,
): Resolver<TArgs, TResult | ApiResponse, TContext> {
  return async (parent, args, context) => {
    try {
      return await fn(parent, args, context);
    } catch (error) {
      if (error instanceof AppException) {
        return { code: error.statusCode, success: false, message: error.message };
      }
      throw error;
    }
  };
}
