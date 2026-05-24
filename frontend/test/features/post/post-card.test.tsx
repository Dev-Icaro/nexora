import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LIKE_POST } from '@/features/post/api/post.mutations';
import { PostCard } from '@/features/post/components/post-card';

import { renderWithProviders, makeAuthContext } from '../../utils';
import { makePost, makeUser } from '../../mocks/data';

vi.mock('@/shared/lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const currentUser = makeUser({ id: 'user-1' });

function likeSuccessMock(postId: string) {
  return {
    request: { query: LIKE_POST, variables: { postId } },
    result: { data: { likePost: { code: 200, message: 'OK', success: true } } },
  };
}

function likeErrorMock(postId: string) {
  return {
    request: { query: LIKE_POST, variables: { postId } },
    error: new Error('Like failed'),
  };
}

describe('PostCard', () => {
  it('renders the post body and author username', () => {
    const post = makePost({ body: 'Hello world #test', author: { id: 'user-2', username: 'author', avatarUrl: null } });
    renderWithProviders(<PostCard post={post} />, {
      authContext: makeAuthContext({ state: { user: currentUser, isAuthenticated: true } }),
    });

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('author')).toBeInTheDocument();
  });

  it('renders hashtags as badges', () => {
    const post = makePost({ body: 'Post body #react #typescript' });
    renderWithProviders(<PostCard post={post} />);

    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#typescript')).toBeInTheDocument();
  });

  it('shows the initial like count', () => {
    const post = makePost({ likeCount: 7 });
    renderWithProviders(<PostCard post={post} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('optimistically increments like count on click', async () => {
    const user = userEvent.setup();
    const post = makePost({ id: 'post-1', likeCount: 3 });
    renderWithProviders(<PostCard post={post} />, {
      mocks: [likeSuccessMock('post-1')],
      authContext: makeAuthContext({ state: { user: currentUser, isAuthenticated: true } }),
    });

    await user.click(screen.getByText('3').closest('button')!);

    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('reverts like count when mutation errors', async () => {
    const user = userEvent.setup();
    const post = makePost({ id: 'post-1', likeCount: 5 });
    renderWithProviders(<PostCard post={post} />, {
      mocks: [likeErrorMock('post-1')],
      authContext: makeAuthContext({ state: { user: currentUser, isAuthenticated: true } }),
    });

    await user.click(screen.getByText('5').closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('renders post image when mediaUrl is provided', () => {
    const post = makePost({ mediaUrl: 'https://example.com/image.jpg' });
    renderWithProviders(<PostCard post={post} />);
    expect(screen.getByRole('img', { name: /post media/i })).toBeInTheDocument();
  });

  it('calls onOpenModal with post id when comment button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenModal = vi.fn();
    const post = makePost({ id: 'post-1', commentCount: 2 });
    renderWithProviders(<PostCard post={post} onOpenModal={onOpenModal} />, {
      authContext: makeAuthContext({ state: { user: currentUser, isAuthenticated: true } }),
    });

    await user.click(screen.getByText('2').closest('button')!);
    expect(onOpenModal).toHaveBeenCalledWith('post-1');
  });
});
