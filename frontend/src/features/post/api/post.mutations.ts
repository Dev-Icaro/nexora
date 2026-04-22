import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($body: String!, $mediaUrl: String) {
    createPost(body: $body, mediaUrl: $mediaUrl) {
      code
      message
      success
      post {
        id
        body
        mediaUrl
        createdAt
        username
        likeCount
        commentCount
      }
    }
  }
`;
