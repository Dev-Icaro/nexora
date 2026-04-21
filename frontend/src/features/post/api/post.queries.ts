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
          username
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
