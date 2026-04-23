import { useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bookmark, Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/utils/toast';

import type { LikePostMutationResponse, LikePostVariables } from '../api/post.mutations';
import { LIKE_POST } from '../api/post.mutations';
import type { PostNode } from '../api/post.types';

dayjs.extend(relativeTime);

interface PostCardProps {
  post: PostNode;
  onOpenModal?: (postId: string) => void;
}

export function PostCard({ post, onOpenModal }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { state } = useAuth();
  const userId = state.user?.id;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  useEffect(() => {
    setLiked(!!userId && post.likes.some(l => l.author.id === userId));
    setLikeCount(post.likeCount);
  }, [post, userId]);

  const [likePost] = useMutation<LikePostMutationResponse, LikePostVariables>(LIKE_POST);

  const handleLike = async () => {
    const next = !liked;
    setLiked(next);
    setLikeCount(c => c + (next ? 1 : -1));
    try {
      await likePost({ variables: { postId: post.id } });
    } catch {
      setLiked(!next);
      setLikeCount(c => c + (next ? -1 : 1));
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
            <Avatar className="size-12 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{post.author.username}</p>
              <p className="text-xs text-muted-foreground">{timestamp}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label="Post options">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Save post</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Optional media */}
        {post.mediaUrl && (
          <img src={post.mediaUrl} alt="Post media" className="w-full rounded-xl object-cover max-h-80" />
        )}

        {/* Body text */}
        <div>
          <p className={cn('text-sm leading-relaxed', !expanded && 'line-clamp-3')}>{bodyText}</p>
          {isLong && (
            <button onClick={() => setExpanded(v => !v)} className="text-xs text-primary hover:underline mt-0.5">
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
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <MessageCircle className="size-4" />
              {post.commentCount}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <Send className="size-4" />0
            </button>
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors" aria-label="Bookmark">
            <Bookmark className="size-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
