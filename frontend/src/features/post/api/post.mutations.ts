import { graphql } from '@/gql';

export const GET_UPLOAD_URL = graphql(`
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
`);

export const CREATE_POST = graphql(`
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
`);

export const LIKE_POST = graphql(`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      code
      message
      success
    }
  }
`);

export const CREATE_COMMENT = graphql(`
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
          avatarUrl
        }
      }
    }
  }
`);
