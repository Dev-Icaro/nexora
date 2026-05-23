import { graphql } from '@/gql';

export const UPDATE_PROFILE_MUTATION = graphql(`
  mutation UpdateProfile($updateProfileRequest: UpdateProfileRequest!) {
    updateProfile(updateProfileRequest: $updateProfileRequest) {
      code
      message
      success
      user {
        id
        email
        username
        bio
        position
        avatarUrl
      }
    }
  }
`);

export const GET_AVATAR_UPLOAD_URL = graphql(`
  mutation GetAvatarUploadUrl($request: GetUploadUrlRequest!) {
    getAvatarUploadUrl(request: $request) {
      code
      message
      success
      uploadUrl
      fields
      objectKey
    }
  }
`);
