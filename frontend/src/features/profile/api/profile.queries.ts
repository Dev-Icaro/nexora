import { graphql } from '@/gql';
import type { GetProfileQuery } from '@/gql/graphql';

export type ProfileUser = NonNullable<GetProfileQuery['getUserById']>;
export type StorageInfo = ProfileUser['storageInfo'];

export const GET_PROFILE = graphql(`
  query GetProfile($userId: ID!) {
    getUserById(userId: $userId) {
      id
      username
      bio
      position
      avatarUrl
      email
      storageInfo {
        usedBytes
        quotaBytes
        remainingBytes
        usedPercent
      }
    }
  }
`);
