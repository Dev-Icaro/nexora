import { gql } from '@apollo/client';

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
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;
