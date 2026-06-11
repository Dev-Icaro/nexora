import { useFragment, useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useProfileNavigation } from '@/shared/hooks/use-profile-navigation';
import { toast } from '@/shared/lib/toast';
import { cn } from '@/shared/lib/utils';

import { LIKE_POST, POST_LIKE_FIELDS } from '../api/post.mutations';
import type { PostNode } from '../api/post.queries';
import { useBookmark } from '../hooks/use-bookmark';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: PostNode;
  onOpenModal?: (postId: string) => void;
  onFollow?: () => void;
}

export function PostCard({ post, onOpenModal, onFollow }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(!!post.author.avatarUrl);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const { state } = useAuth();
  const userId = state.user?.id;
  const { navigateToProfile } = useProfileNavigation();

  const { data: likeData, complete: likeComplete } = useFragment({
    fragment: POST_LIKE_FIELDS,
    fragmentName: 'PostLikeFields',
    from: { __typename: 'Post', id: post.id },
  });
  const liked = likeComplete ? (likeData.isLiked ?? false) : (post.isLiked ?? false);
  const likeCount = likeComplete ? likeData.likeCount : post.likeCount;

  const showFollowButton = post.author.isFollowing === false && post.author.id !== userId;

  const [likePost] = useMutation(LIKE_POST);
  const { bookmarked, toggleBookmark } = useBookmark(post.id, post.isBookmarked);

  const handleLike = async () => {
    try {
      await likePost({
        variables: { postId: post.id },
        optimisticResponse: {
          likePost: {
            __typename: 'LikePostResponse',
            code: 200,
            message: '',
            success: true,
            post: {
              __typename: 'Post',
              id: post.id,
              isLiked: !liked,
              likeCount: Math.max(0, likeCount + (liked ? -1 : 1)),
            },
          },
        },
      });
    } catch {
      toast.error('Failed to update like');
    }
  };

  const initials = post.author.username.slice(0, 2).toUpperCase();
  const timestamp = dayjs(post.createdAt).fromNow();
  const hashtags = post.body.match(/#\w+/g) ?? [];
  const bodyText = post.body.replace(/#\w+/g, '').trim();
  const isLong = bodyText.length > 200;

  return (
    <Card className="bg-card border border-border rounded-lg">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                navigateToProfile(post.author.id);
              }}
              className="rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
              aria-label={`View ${post.author.username}'s profile`}
            >
              <Avatar className="size-12">
                {post.author.avatarUrl && (
                  <AvatarImage
                    src={post.author.avatarUrl}
                    alt={post.author.username}
                    onLoadingStatusChange={status => {
                      if (status === 'loaded' || status === 'error') setAvatarLoading(false);
                    }}
                  />
                )}
                <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                  {avatarLoading ? <Skeleton className="size-full rounded-full" /> : initials}
                </AvatarFallback>
              </Avatar>
            </button>
            <div>
              <p
                onClick={e => {
                  e.stopPropagation();
                  navigateToProfile(post.author.id);
                }}
                className="text-sm font-semibold cursor-pointer hover:underline"
              >
                {post.author.username}
              </p>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
            {showFollowButton && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                onClick={e => {
                  e.stopPropagation();
                  onFollow?.();
                }}
              >
                <UserPlus className="size-3 mr-1" />
                Follow
              </Button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Post options">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={toggleBookmark}>
                {bookmarked ? 'Remove bookmark' : 'Save post'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Optional media */}
        {post.mediaUrl && (
          <div className="relative w-full rounded-xl overflow-hidden">
            {!mediaLoaded && <Skeleton className="w-full h-64 rounded-xl" />}
            <img
              src={post.mediaUrl}
              alt="Post media"
              className={cn('w-full rounded-xl object-cover max-h-80', !mediaLoaded && 'hidden')}
              onLoad={() => setMediaLoaded(true)}
              onError={() => setMediaLoaded(true)}
            />
          </div>
        )}

        {/* Body text */}
        <div>
          <p className={cn('text-sm leading-relaxed', !expanded && 'line-clamp-3')}>{bodyText}</p>
          {isLong && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="text-xs text-primary hover:underline mt-0.5 cursor-pointer"
            >
              {expanded ? 'show less' : 'read more'}
            </button>
          )}
        </div>

        {/* Hashtag chips */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {hashtags.map(tag => (
              <Badge key={tag} variant="outline" className="text-primary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Engagement counters */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors bg-transparent border-none cursor-pointer',
                liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Heart className={cn('size-4', liked && 'fill-current')} />
              <span className={cn('font-semibold', liked ? 'text-primary' : 'text-foreground')}>{likeCount}</span>
            </button>
            <button
              onClick={() => onOpenModal?.(post.id)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              <MessageCircle className="size-4" />
              {post.commentCount}
            </button>
            <button
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              onClick={() => toast.info('Coming soon!')}
            >
              <Send className="size-4" />0
            </button>
          </div>
          <button
            onClick={toggleBookmark}
            className={cn(
              'transition-colors cursor-pointer',
              bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-primary',
            )}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={cn('size-4', bookmarked && 'fill-current')} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
