import { graphql } from '@/gql';

export const FOLLOW_USER = graphql(`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      code
      success
      message
      user {
        id
        followersCount
        isFollowing
      }
    }
  }
`);

export const UNFOLLOW_USER = graphql(`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      code
      success
      message
      user {
        id
        followersCount
        isFollowing
      }
    }
  }
`);

export const REMOVE_FOLLOWER = graphql(`
  mutation RemoveFollower($userId: ID!) {
    removeFollower(userId: $userId) {
      code
      success
      message
      user {
        id
        followersCount
      }
    }
  }
`);
