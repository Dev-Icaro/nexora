import { useQuery } from '@apollo/client/react';
import { useRef, useState } from 'react';

import { GET_USER_POSTS } from '../api/post.queries';
import type { PostNode, UserPostsRequest, UserPostsResponse } from '../api/post.types';

const PAGE_SIZE = 10;

export type UseUserPostsResult = {
  posts: PostNode[];
  loading: boolean;
  isFetchingNextPage: boolean;
  error: string | undefined;
  paginationError: string | undefined;
  refetch: () => void;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
};

export function useUserPosts(userId: string): UseUserPostsResult {
  const [paginationError, setPaginationError] = useState<string>();
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const isFetchingNextPageRef = useRef(false);

  const {
    data,
    loading,
    error,
    fetchMore,
    refetch: apolloRefetch,
  } = useQuery<UserPostsResponse, UserPostsRequest>(GET_USER_POSTS, {
    variables: { userId, first: PAGE_SIZE },
  });

  const posts = data?.getUserPosts.edges.map(e => e.node) ?? [];
  const pageInfo = data?.getUserPosts.pageInfo;

  const fetchNextPage = async () => {
    if (!pageInfo?.hasNextPage || isFetchingNextPageRef.current) return;

    setPaginationError(undefined);
    isFetchingNextPageRef.current = true;
    setIsFetchingNextPage(true);
    try {
      await fetchMore({
        variables: { userId, first: PAGE_SIZE, after: pageInfo.endCursor ?? undefined },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            getUserPosts: {
              ...fetchMoreResult.getUserPosts,
              edges: [...prev.getUserPosts.edges, ...fetchMoreResult.getUserPosts.edges],
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
  };
}
