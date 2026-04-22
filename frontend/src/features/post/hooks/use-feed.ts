import { useQuery } from '@apollo/client/react';
import { useRef, useState } from 'react';

import { GET_FEED } from '../api/post.queries';
import type { FeedRequest, FeedResponse, PostNode } from '../api/post.types';

const PAGE_SIZE = 10;

export type UseFeedResult = {
  posts: PostNode[];
  loading: boolean;
  isFetchingNextPage: boolean;
  error: string | undefined;
  paginationError: string | undefined;
  refetch: () => void;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  prependPost: (post: PostNode) => void;
};

export function useFeed(): UseFeedResult {
  const [localPosts, setLocalPosts] = useState<PostNode[]>([]);
  const [paginationError, setPaginationError] = useState<string>();
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const isFetchingNextPageRef = useRef(false);

  const {
    data,
    loading,
    error,
    fetchMore,
    refetch: apolloRefetch,
  } = useQuery<FeedResponse, FeedRequest>(GET_FEED, {
    variables: { first: PAGE_SIZE },
  });

  const serverPosts = data?.feed.edges.map(e => e.node) ?? [];
  const posts = [...localPosts, ...serverPosts];
  const pageInfo = data?.feed.pageInfo;

  const prependPost = (post: PostNode) => setLocalPosts(prev => [post, ...prev]);

  const fetchNextPage = async () => {
    if (!pageInfo?.hasNextPage || isFetchingNextPageRef.current) return;

    setPaginationError(undefined);
    isFetchingNextPageRef.current = true;
    setIsFetchingNextPage(true);
    try {
      await fetchMore({
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
      setPaginationError(undefined);
    } catch (fetchMoreError) {
      setPaginationError(fetchMoreError instanceof Error ? fetchMoreError.message : 'Unable to load more posts.');
    } finally {
      isFetchingNextPageRef.current = false;
      setIsFetchingNextPage(false);
    }
  };

  const refetch = () => {
    setPaginationError(undefined);
    setLocalPosts([]);
    void apolloRefetch();
  };

  return {
    posts,
    loading,
    isFetchingNextPage,
    error: error?.message,
    paginationError,
    refetch,
    fetchNextPage,
    hasNextPage: pageInfo?.hasNextPage ?? false,
    prependPost,
  };
}
