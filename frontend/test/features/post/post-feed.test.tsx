import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PostFeed } from '@/features/post/components/post-feed';

import { renderWithProviders } from '../../utils';
import { makePost } from '../../mocks/data';

vi.mock('@/shared/lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

const baseProps = {
  posts: [],
  loading: false,
  isFetchingNextPage: false,
  hasNextPage: false,
  onRetry: vi.fn(),
  onLoadMore: vi.fn().mockResolvedValue(undefined),
};

describe('PostFeed', () => {
  it('shows skeleton when loading with no posts', () => {
    renderWithProviders(<PostFeed {...baseProps} loading={true} />);
    // PostFeedSkeleton renders Skeleton elements — confirm it's not showing content
    expect(screen.queryByText(/nothing here yet/i)).toBeNull();
    expect(screen.queryByText(/something went wrong/i)).toBeNull();
    // Skeleton cards should be present
    expect(document.querySelectorAll('[data-slot="card"]').length).toBeGreaterThan(0);
  });

  it('shows error state when there is an error and no posts', () => {
    renderWithProviders(<PostFeed {...baseProps} error="Failed to load" />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked in error state', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    renderWithProviders(<PostFeed {...baseProps} error="Failed to load" onRetry={onRetry} />);

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('shows empty state when there are no posts and no loading or error', () => {
    renderWithProviders(<PostFeed {...baseProps} />);
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
  });

  it('renders a post card for each post', () => {
    const posts = [makePost({ id: 'p-1', body: 'First post' }), makePost({ id: 'p-2', body: 'Second post' })];
    renderWithProviders(<PostFeed {...baseProps} posts={posts} />);

    expect(screen.getByText('First post')).toBeInTheDocument();
    expect(screen.getByText('Second post')).toBeInTheDocument();
  });

  it('shows uploading skeleton when isUploadingPost is true', () => {
    const posts = [makePost({ id: 'p-1', body: 'A post' })];
    renderWithProviders(<PostFeed {...baseProps} posts={posts} isUploadingPost={true} />);
    expect(document.querySelectorAll('[class*="animate"]').length).toBeGreaterThan(0);
  });

  it('shows pagination error with retry when paginationError is set', () => {
    const posts = [makePost({ id: 'p-1', body: 'A post' })];
    renderWithProviders(<PostFeed {...baseProps} posts={posts} paginationError="Could not load more" />);
    expect(screen.getByText(/could not load more/i)).toBeInTheDocument();
  });
});
