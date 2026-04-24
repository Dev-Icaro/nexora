import { gql } from '@apollo/client';

export const GET_PROFILE = gql`
  query GetProfile($userId: ID!) {
    getUserById(userId: $userId) {
      id
      username
      bio
      position
    }
  }
`;
