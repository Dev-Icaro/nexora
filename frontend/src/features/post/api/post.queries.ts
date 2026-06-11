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
      isBookmarked
      isLiked
      comments {
        id
        body
        createdAt
        likeCount
        author {
          id
          username
          avatarUrl
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
          isBookmarked
          isLiked
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
      isLiked
    }
  }
`);

export const GET_BOOKMARKED = graphql(`
  query GetBookmarked($first: Int, $after: String) {
    getBookmarked(first: $first, after: $after) {
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
          isBookmarked
          isLiked
        }
      }
      pageInfo {
        endCursor
        hasNextPage
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
          isBookmarked
          isLiked
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`);
