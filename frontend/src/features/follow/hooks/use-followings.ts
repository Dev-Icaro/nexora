import { useLazyQuery } from '@apollo/client/react';
import { useRef, useState } from 'react';

import { toast } from '@/shared/lib/toast';

import { GET_USER_FOLLOWINGS } from '../api/follow.queries';
import type { FollowListUser } from '../components/followers-following-modal';

const PAGE_SIZE = 20;

export type UseFollowingsResult = {
  users: FollowListUser[];
  loading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetch: (userId: string) => void;
  fetchNextPage: () => Promise<void>;
};

export function useFollowings(): UseFollowingsResult {
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const isFetchingNextPageRef = useRef(false);

  const [executeQuery, { data, loading, fetchMore, variables }] = useLazyQuery(GET_USER_FOLLOWINGS);

  const users: FollowListUser[] = (data?.getUserFollowings.edges ?? []).map(edge => ({
    id: edge.node.id,
    name: edge.node.username,
    username: edge.node.username,
    avatarUrl: edge.node.avatarUrl ?? undefined,
    isFollowedByCurrentUser: edge.node.isFollowing ?? false,
  }));

  const pageInfo = data?.getUserFollowings.pageInfo;

  function fetch(userId: string) {
    executeQuery({ variables: { userId, first: PAGE_SIZE } });
  }

  const fetchNextPage = async () => {
    if (!pageInfo?.hasNextPage || isFetchingNextPageRef.current || !variables?.userId) return;

    isFetchingNextPageRef.current = true;
    setIsFetchingNextPage(true);
    try {
      await fetchMore({
        variables: { userId: variables.userId, first: PAGE_SIZE, after: pageInfo.endCursor ?? undefined },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            getUserFollowings: {
              ...fetchMoreResult.getUserFollowings,
              edges: [...prev.getUserFollowings.edges, ...fetchMoreResult.getUserFollowings.edges],
            },
          };
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load more followings');
    } finally {
      isFetchingNextPageRef.current = false;
      setIsFetchingNextPage(false);
    }
  };

  return {
    users,
    loading,
    isFetchingNextPage,
    hasNextPage: pageInfo?.hasNextPage ?? false,
    fetch,
    fetchNextPage,
  };
}
