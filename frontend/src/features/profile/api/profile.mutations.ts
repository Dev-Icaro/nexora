import { gql } from '@apollo/client';

export const UPDATE_PROFILE_MUTATION = gql`
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
      }
    }
  }
`;
