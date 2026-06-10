import { type ApolloCache, type Reference } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useRef, useState } from 'react';

import { toast } from '@/shared/lib/toast';

import { ADD_BOOKMARK, REMOVE_BOOKMARK } from '../api/post.mutations';
import { GET_BOOKMARKED, type PostNode } from '../api/post.queries';

type UseBookmarkResult = {
  bookmarked: boolean;
  toggleBookmark: () => Promise<void>;
  loading: boolean;
};

export function useBookmark(postId: string, initialBookmarked: boolean | null | undefined): UseBookmarkResult {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const bookmarked = optimistic !== null ? optimistic : (initialBookmarked ?? false);

  const [addBookmark, { loading: adding }] = useMutation(ADD_BOOKMARK, {
    update(cache: ApolloCache, _, opt) {
      cache.modify({
        id: cache.identify({ __typename: 'Post', id: opt.variables?.postId }),
        fields: { isBookmarked: () => true },
      });
      cache.evict({ fieldName: 'getBookmarked' });
      cache.gc();
    },
  });
  const [removeBookmark, { loading: removing }] = useMutation(REMOVE_BOOKMARK, {
    update(cache: ApolloCache, _, opt) {
      cache.modify({
        id: cache.identify({ __typename: 'Post', id: opt.variables?.postId }),
        fields: { isBookmarked: () => false },
      });
      cache.modify({
        fields: {
          getBookmarked(
            existingUnknown: unknown,
            { readField }: { readField: (field: string, ref?: Reference) => unknown },
          ) {
            const existing = existingUnknown as { edges: Reference[]; [key: string]: unknown };
            return {
              ...existing,
              edges: existing.edges.filter(
                (edge: Reference) => readField('id', readField('node', edge) as Reference) !== opt.variables?.postId,
              ),
            };
          },
        },
      });
    },
  });

  const toggleBookmark = async () => {
    const next = !bookmarked;
    setOptimistic(next);
    try {
      if (next) {
        await addBookmark({ variables: { postId } });
      } else {
        await removeBookmark({ variables: { postId } });
      }
    } catch {
      setOptimistic(!next);
      toast.error(next ? 'Failed to bookmark post' : 'Failed to remove bookmark');
    }
  };

  return { bookmarked, toggleBookmark, loading: adding || removing };
}

const PAGE_SIZE = 10;

export type UseBookmarkedPostsResult = {
  posts: PostNode[];
  loading: boolean;
  isFetchingNextPage: boolean;
  error: string | undefined;
  paginationError: string | undefined;
  refetch: () => void;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
};

export function useBookmarkedPosts(): UseBookmarkedPostsResult {
  const [paginationError, setPaginationError] = useState<string>();
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const isFetchingNextPageRef = useRef(false);

  const {
    data,
    loading,
    error,
    fetchMore,
    refetch: apolloRefetch,
  } = useQuery(GET_BOOKMARKED, {
    variables: { first: PAGE_SIZE },
  });

  const posts = data?.getBookmarked.edges.map(e => e.node) ?? [];
  const pageInfo = data?.getBookmarked.pageInfo;

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
            getBookmarked: {
              ...fetchMoreResult.getBookmarked,
              edges: [...prev.getBookmarked.edges, ...fetchMoreResult.getBookmarked.edges],
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
