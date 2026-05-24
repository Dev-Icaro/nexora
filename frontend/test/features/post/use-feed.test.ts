import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GET_FEED } from '@/features/post/api/post.queries';
import { useFeed } from '@/features/post/hooks/use-feed';

import { createWrapper } from '../../utils';
import { makePost, makeFeedPage } from '../../mocks/data';

const PAGE_SIZE = 10;

function feedMock(
  posts = [makePost()],
  pageInfo: { hasNextPage: boolean; endCursor: string | null } = { hasNextPage: false, endCursor: null },
) {
  return {
    request: { query: GET_FEED, variables: { first: PAGE_SIZE } },
    result: { data: makeFeedPage(posts, pageInfo) },
  };
}

describe('useFeed', () => {
  it('returns loading=true before data arrives', () => {
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper({ mocks: [feedMock()] }),
    });
    expect(result.current.loading).toBe(true);
  });

  it('returns posts from the server after query resolves', async () => {
    const post = makePost({ id: 'p-1', body: 'Hello world' });
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper({ mocks: [feedMock([post])] }),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.posts).toHaveLength(1);
    expect(result.current.posts[0].body).toBe('Hello world');
  });

  it('exposes hasNextPage from the server response', async () => {
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper({
        mocks: [feedMock([makePost()], { hasNextPage: true, endCursor: 'cursor-0' })],
      }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('returns an error message when the query fails', async () => {
    const errorMock = {
      request: { query: GET_FEED, variables: { first: PAGE_SIZE } },
      error: new Error('Network error'),
    };
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper({ mocks: [errorMock] }),
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });
  });

  it('prependPost adds a post to the front of the list', async () => {
    const serverPost = makePost({ id: 'server-1' });
    const localPost = makePost({ id: 'local-1', body: 'Local post' });

    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper({ mocks: [feedMock([serverPost])] }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.prependPost(localPost);
    });

    await waitFor(() => {
      expect(result.current.posts[0].id).toBe('local-1');
      expect(result.current.posts[1].id).toBe('server-1');
    });
  });

  it('fetchNextPage is a no-op when hasNextPage is false', async () => {
    const { result } = renderHook(() => useFeed(), {
      wrapper: createWrapper({ mocks: [feedMock()] }),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);

    await result.current.fetchNextPage();
    expect(result.current.isFetchingNextPage).toBe(false);
  });
});
