import { useQuery } from '@apollo/client/react';

import { GET_FEED } from '../api/post.queries';
import type { FeedRequest, FeedResponse, PostNode } from '../api/post.types';

const PAGE_SIZE = 10;

export type UseFeedResult = {
  posts: PostNode[];
  loading: boolean;
  error: string | undefined;
  fetchNextPage: () => void;
  hasNextPage: boolean;
};

export function useFeed(): UseFeedResult {
  const { data, loading, error, fetchMore } = useQuery<FeedResponse, FeedRequest>(GET_FEED, {
    variables: { first: PAGE_SIZE },
  });

  const posts = data?.feed.edges.map(e => e.node) ?? [];
  const pageInfo = data?.feed.pageInfo;

  const fetchNextPage = () => {
    if (!pageInfo?.hasNextPage) return;
    fetchMore({
      variables: { first: PAGE_SIZE, after: pageInfo.endCursor ?? undefined },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          feed: {
            ...fetchMoreResult.feed,
            edges: [...prev.feed.edges, ...fetchMoreResult.feed.edges],
          },
        };
      },
    });
  };

  return {
    posts,
    loading,
    error: error?.message,
    fetchNextPage,
    hasNextPage: pageInfo?.hasNextPage ?? false,
  };
}
