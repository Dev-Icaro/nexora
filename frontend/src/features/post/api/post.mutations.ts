import { gql } from '@apollo/client';

export const GET_UPLOAD_URL = gql`
  mutation GetUploadUrl($request: GetUploadUrlRequest!) {
    getUploadUrl(request: $request) {
      code
      message
      success
      uploadUrl
      fields
      objectKey
    }
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($body: String!, $objectKey: String) {
    createPost(body: $body, objectKey: $objectKey) {
      code
      message
      success
      post {
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
      }
    }
  }
`;

export type LikePostVariables = { postId: string };
export type LikePostMutationResponse = {
  likePost: { code: number; message: string; success: boolean };
};

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      code
      message
      success
    }
  }
`;

export type CreateCommentVariables = { postId: string; body: string };
export type CreateCommentMutationResponse = {
  createComment: {
    code: number;
    message: string;
    success: boolean;
    comment?: {
      id: string;
      body: string;
      createdAt: string;
      author: { id: string; username: string };
    };
  };
};

export const CREATE_COMMENT = gql`
  mutation CreateComment($postId: String!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      code
      message
      success
      comment {
        id
        body
        createdAt
        author {
          id
          username
        }
      }
    }
  }
`;
