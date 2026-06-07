import { useVirtualizer } from '@tanstack/react-virtual';
import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/shared/components/ui/dialog';
import { Spinner } from '@/shared/components/ui/spinner';
import { useProfileNavigation } from '@/shared/hooks/use-profile-navigation';
import { cn, getInitials } from '@/shared/lib/utils';

import { FollowListSkeleton } from './follow-list-skeleton';

export type FollowListUser = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  isFollowedByCurrentUser: boolean;
};

type FollowersFollowingModalProps = {
  open: boolean;
  type: 'followers' | 'following';
  users: FollowListUser[];
  onClose: () => void;
  loading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => Promise<void>;
  onFollowBack?: (userId: string) => void;
  onRemoveFollower?: (userId: string) => void;
  onToggleFollow?: (userId: string) => void;
};

export function FollowersFollowingModal({
  open,
  type,
  users,
  onClose,
  loading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onFollowBack,
  onRemoveFollower,
  onToggleFollow,
}: FollowersFollowingModalProps) {
  'use no memo';
  const [search, setSearch] = useState('');
  const [sentinelEl, setSentinelEl] = useState<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { navigateToProfile } = useProfileNavigation();

  function handleUserClick(userId: string) {
    onClose();
    navigateToProfile(userId);
  }

  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
  });

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 68,
    overscan: 5,
  });

  useEffect(() => {
    if (!sentinelEl || !hasNextPage || isFetchingNextPage || !scrollContainerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          onLoadMore?.();
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: '0px 0px 120px 0px',
      },
    );

    observer.observe(sentinelEl);

    return () => observer.disconnect();
  }, [sentinelEl, hasNextPage, isFetchingNextPage, onLoadMore]);

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setSearch('');
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className="flex flex-col w-[460px] max-w-[calc(100vw-2rem)] sm:max-w-none gap-0 rounded-[20px] bg-card p-0 ring-0 border border-border shadow-[0_24px_64px_oklch(0_0_0/60%)] overflow-hidden"
      >
        <DialogTitle className="sr-only">{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>

        {/* Header */}
        <div className="relative flex items-center justify-center px-14 py-[18px] border-b border-border">
          <span className="text-base font-semibold text-foreground">
            {type === 'followers' ? 'Followers' : 'Following'}
          </span>
          <DialogClose asChild>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 size-8 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-accent transition-colors cursor-pointer">
              <X className="size-4" />
            </button>
          </DialogClose>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2.5 bg-muted rounded-full px-3.5 py-[9px]">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="bg-transparent border-none outline-none flex-1 text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* List */}
        <div ref={scrollContainerRef} className="overflow-y-auto max-h-[420px] [scrollbar-width:thin]">
          {loading && <FollowListSkeleton count={7} />}
          {!loading && filtered.length === 0 && (
            <div className="py-10 px-5 text-center">
              <p className="text-sm text-muted-foreground">No results found.</p>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <>
              <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map(virtualItem => {
                  const user = filtered[virtualItem.index]!;
                  const isLast = virtualItem.index === filtered.length - 1;

                  return (
                    <div
                      key={user.id}
                      style={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors',
                        !isLast && 'border-b border-border',
                      )}
                    >
                      <button className="cursor-pointer shrink-0" onClick={() => handleUserClick(user.id)}>
                        <Avatar className="size-11">
                          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </button>

                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <button
                            className="text-sm font-semibold text-foreground truncate cursor-pointer hover:underline"
                            onClick={() => handleUserClick(user.id)}
                          >
                            {user.username}
                          </button>
                          {type === 'followers' && !user.isFollowedByCurrentUser && (
                            <button
                              className="text-[13px] text-primary font-medium whitespace-nowrap shrink-0 hover:underline cursor-pointer"
                              onClick={() => onFollowBack?.(user.id)}
                            >
                              · Follow
                            </button>
                          )}
                        </div>
                        <span className="text-[13px] text-muted-foreground truncate">{user.name}</span>
                      </div>

                      {type === 'followers'
                        ? onRemoveFollower && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full shrink-0"
                              onClick={() => onRemoveFollower(user.id)}
                            >
                              Remove
                            </Button>
                          )
                        : onToggleFollow && (
                            <Button
                              variant={user.isFollowedByCurrentUser ? 'outline' : 'default'}
                              size="sm"
                              className="rounded-full shrink-0"
                              onClick={() => onToggleFollow(user.id)}
                            >
                              {user.isFollowedByCurrentUser ? 'Following' : 'Follow'}
                            </Button>
                          )}
                    </div>
                  );
                })}
              </div>

              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              )}

              <div ref={setSentinelEl} />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
