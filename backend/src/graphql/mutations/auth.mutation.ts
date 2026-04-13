import type RegisterRequest from '@/dtos/register-request.dto';

import type { GraphQLContext } from '../context';
import { withErrorHandling } from '../with-error-handling';

export const authMutations = {
  register: withErrorHandling(
    async (_, { registerRequest }: { registerRequest: RegisterRequest }, { dataSources }: GraphQLContext) =>
      dataSources.authService.register(registerRequest),
  ),

  login: async () => {
    throw new Error('Not implemented');
  },
};
