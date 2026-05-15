import type { GraphQLContext } from '../context';

export const userMutations = {
  updateProfile: async (
    _: unknown,
    { updateProfileRequest }: { updateProfileRequest: { bio?: string; position?: string; objectKey?: string } },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.userService.updateProfile(currentUser!.userId, updateProfileRequest),

  updateThemePreference: async (
    _: unknown,
    { theme }: { theme: string },
    { dataSources, currentUser }: GraphQLContext,
  ) => dataSources.userService.updateThemePreference(currentUser!.userId, { theme }),

  getAvatarUploadUrl: async (
    _: unknown,
    { request }: { request: { filename: string; contentType: string; fileSizeBytes: number } },
    { dataSources, currentUser }: GraphQLContext,
  ) =>
    dataSources.userService.getAvatarUploadUrl(
      currentUser!.userId,
      request.filename,
      request.contentType,
      request.fileSizeBytes,
    ),
};
