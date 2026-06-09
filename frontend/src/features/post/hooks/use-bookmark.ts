import { useMutation } from '@apollo/client/react';
import { useState } from 'react';

import { toast } from '@/shared/lib/toast';

import { ADD_BOOKMARK, REMOVE_BOOKMARK } from '../api/post.mutations';

type UseBookmarkResult = {
  bookmarked: boolean;
  toggleBookmark: () => Promise<void>;
  loading: boolean;
};

export function useBookmark(postId: string, initialBookmarked: boolean | null | undefined): UseBookmarkResult {
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const bookmarked = optimistic !== null ? optimistic : (initialBookmarked ?? false);

  const [addBookmark, { loading: adding }] = useMutation(ADD_BOOKMARK);
  const [removeBookmark, { loading: removing }] = useMutation(REMOVE_BOOKMARK);

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
