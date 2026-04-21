import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import { GET_FEED } from '../api/post.queries';
import type { FeedRequest, FeedResponse, PostNode } from '../api/post.types';

const PAGE_SIZE = 10;

export type UseFeedResult = {
  posts: PostNode[];
  loading: boolean;
  error: string | undefined;
  paginationError: string | undefined;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
};

export function useFeed(): UseFeedResult {
  const [paginationError, setPaginationError] = useState<string>();

  const {
    data,
    loading,
    error,
    fetchMore,
    refetch: apolloRefetch,
  } = useQuery<FeedResponse, FeedRequest>(GET_FEED, {
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
    })
      .then(() => setPaginationError(undefined))
      .catch(fetchMoreError => {
        setPaginationError(fetchMoreError instanceof Error ? fetchMoreError.message : 'Unable to load more posts.');
      });
  };

  const refetch = () => {
    setPaginationError(undefined);
    void apolloRefetch();
  };

  return {
    posts,
    loading,
    error: error?.message,
    paginationError,
    refetch,
    fetchNextPage,
    hasNextPage: pageInfo?.hasNextPage ?? false,
  };
}
