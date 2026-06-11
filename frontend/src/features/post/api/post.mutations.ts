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
      __typename
      code
      message
      success
      post {
        __typename
        id
        isLiked
        likeCount
      }
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

export const ADD_BOOKMARK = graphql(`
  mutation AddBookmark($postId: ID!) {
    addBookmark(postId: $postId) {
      code
      message
      success
    }
  }
`);

export const REMOVE_BOOKMARK = graphql(`
  mutation RemoveBookmark($postId: ID!) {
    removeBookmark(postId: $postId) {
      code
      message
      success
    }
  }
`);

export const LIKE_COMMENT = graphql(`
  mutation LikeComment($commentId: ID!) {
    likeComment(commentId: $commentId) {
      code
      success
      message
      comment {
        id
        likeCount
      }
    }
  }
`);

export const UNLIKE_COMMENT = graphql(`
  mutation UnlikeComment($commentId: ID!) {
    unlikeComment(commentId: $commentId) {
      code
      success
      message
      comment {
        id
        likeCount
      }
    }
  }
`);
