import { graphql } from '@/gql';
import type { GetUserFollowersQuery } from '@/gql/graphql';

export const GET_USER_FOLLOWERS = graphql(`
  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {
    getUserFollowers(userId: $userId, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          username
          avatarUrl
          isFollowing
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const GET_USER_FOLLOWINGS = graphql(`
  query GetUserFollowings($userId: ID!, $first: Int, $after: String) {
    getUserFollowings(userId: $userId, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          username
          avatarUrl
          isFollowing
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export type FollowEdgeUser = GetUserFollowersQuery['getUserFollowers']['edges'][number]['node'];
