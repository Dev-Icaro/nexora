import { graphql } from '@/gql';
import type { GetFeedQuery } from '@/gql/graphql';

export type PostNode = GetFeedQuery['feed']['edges'][number]['node'];

export const GET_POST_BY_ID = graphql(`
  query GetPost($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      mediaUrl
      createdAt
      author {
        id
        username
        avatarUrl
      }
      likeCount
      commentCount
      comments {
        id
        body
        createdAt
        author {
          id
          username
          avatarUrl
        }
      }
      likes {
        id
        author {
          id
          username
        }
      }
    }
  }
`);

export const GET_USER_POSTS = graphql(`
  query GetUserPosts($userId: ID!, $first: Int, $after: String) {
    getUserPosts(userId: $userId, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          body
          mediaUrl
          createdAt
          author {
            id
            username
            avatarUrl
            isFollowing
          }
          likeCount
          commentCount
          likes {
            id
            author {
              id
              username
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`);

export const NEW_POST_SUBSCRIPTION = graphql(`
  subscription OnNewPost {
    newPost {
      id
      body
      mediaUrl
      createdAt
      author {
        id
        username
        avatarUrl
      }
      likeCount
      commentCount
      likes {
        id
        author {
          id
          username
        }
      }
    }
  }
`);

export const GET_FEED = graphql(`
  query GetFeed($first: Int, $after: String) {
    feed(first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          body
          mediaUrl
          createdAt
          author {
            id
            username
            avatarUrl
            isFollowing
          }
          likeCount
          commentCount
          likes {
            id
            author {
              id
              username
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`);
