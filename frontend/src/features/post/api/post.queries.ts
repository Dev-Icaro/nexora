import { gql } from '@apollo/client';

export type GetPostByIdVariables = { postId: string };

export type GetPostByIdResponse = {
  getPost: {
    id: string;
    body: string;
    mediaUrl: string | null;
    createdAt: string;
    author: { id: string; username: string };
    likeCount: number;
    commentCount: number;
    comments: Array<{
      id: string;
      body: string;
      createdAt: string;
      author: { id: string; username: string };
    }>;
    likes: Array<{
      id: string;
      author: { id: string; username: string };
    }>;
  } | null;
};

export const GET_POST_BY_ID = gql`
  query GetPost($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      mediaUrl
      createdAt
      author {
        id
        username
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
`;

export const GET_FEED = gql`
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
`;
