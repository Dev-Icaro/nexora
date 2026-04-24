import type { GraphQLContext } from '../context';

export const userMutations = {
  updateProfile: async (
    _: unknown,
    { updateProfileRequest }: { updateProfileRequest: { bio?: string; position?: string } },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.userService.updateProfile(currentUser!.userId, updateProfileRequest),
};
