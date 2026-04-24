import { useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowLeft, Bookmark, Heart, MessageCircle, Send, X } from 'lucide-react';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useProfileNavigation } from '@/shared/hooks/use-profile-navigation';
import { cn } from '@/shared/lib/utils';
import { toast } from '@/shared/utils/toast';

import type {
  CreateCommentMutationResponse,
  CreateCommentVariables,
  LikePostMutationResponse,
  LikePostVariables,
} from '../api/post.mutations';
import { CREATE_COMMENT, LIKE_POST } from '../api/post.mutations';
import type { GetPostByIdResponse } from '../api/post.queries';
import { GET_POST_BY_ID } from '../api/post.queries';
import { usePostDetail } from '../hooks/use-post-detail';

dayjs.extend(relativeTime);

type PostDetail = NonNullable<GetPostByIdResponse['getPost']>;
type CommentDetail = PostDetail['comments'][number];

// ── Sub-components ────────────────────────────────────────────────

function PostDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-12 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-56 w-full rounded-xl" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-2.5 py-3 border-b border-border">
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 pt-0.5">
        <Skeleton className="h-2.5 w-36" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-2/3" />
      </div>
    </div>
  );
}

function EmptyComments() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground">
      <MessageCircle className="size-8" />
      <p className="text-sm">No comments yet. Be the first!</p>
    </div>
  );
}

function NotFoundState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 flex-1 min-h-48 p-6 text-center">
      <div className="size-12 rounded-full bg-muted flex items-center justify-center">
        <MessageCircle className="size-6 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold">Post not found</p>
      <p className="text-sm text-muted-foreground">This post may have been deleted or does not exist.</p>
      <button
        onClick={onClose}
        className="mt-2 text-sm text-primary hover:underline bg-none border-none cursor-pointer"
      >
        ← Back to feed
      </button>
    </div>
  );
}

interface CommentItemProps {
  comment: CommentDetail & { localLiked?: boolean };
  onLike: (id: string) => void;
  onAuthorClick: (userId: string) => void;
}

function CommentItem({ comment, onLike, onAuthorClick }: CommentItemProps) {
  const initials = comment.author.username.slice(0, 2).toUpperCase();
  const timestamp = dayjs(comment.createdAt).fromNow();

  return (
    <div className="flex gap-2.5 py-3 border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => onAuthorClick(comment.author.id)}
        className="rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0 self-start"
        aria-label={`View ${comment.author.username}'s profile`}
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">{initials}</AvatarFallback>
        </Avatar>
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <span
            onClick={() => onAuthorClick(comment.author.id)}
            className="text-[13px] font-semibold cursor-pointer hover:underline"
          >
            {comment.author.username}
          </span>
          <span className="text-[11px] text-muted-foreground ml-auto">{timestamp}</span>
        </div>
        <p className="text-[13px] leading-[1.55] text-foreground mb-2">{comment.body}</p>
        <button
          onClick={() => onLike(comment.id)}
          className={cn(
            'inline-flex items-center gap-1.5 text-xs transition-colors bg-transparent border-none cursor-pointer p-0 min-h-8',
            comment.localLiked ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Heart className={cn('size-3.5', comment.localLiked && 'fill-current')} />
        </button>
      </div>
    </div>
  );
}

interface PostContentPanelProps {
  post: PostDetail;
  liked: boolean;
  likeCount: number;
  saved: boolean;
  onLike: () => void;
  onSave: () => void;
  onAuthorClick: (userId: string) => void;
}

function PostContentPanel({ post, liked, likeCount, saved, onLike, onSave, onAuthorClick }: PostContentPanelProps) {
  const hashtags = post.body.match(/#\w+/g) ?? [];
  const bodyText = post.body.replace(/#\w+/g, '').trim();
  const initials = post.author.username.slice(0, 2).toUpperCase();
  const timestamp = dayjs(post.createdAt).fromNow();

  return (
    <div className="flex flex-col gap-4">
      {/* Author */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onAuthorClick(post.author.id)}
          className="rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          aria-label={`View ${post.author.username}'s profile`}
        >
          <Avatar className="size-12">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </button>
        <div>
          <p
            onClick={() => onAuthorClick(post.author.id)}
            className="text-sm font-semibold cursor-pointer hover:underline"
          >
            {post.author.username}
          </p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
        </div>
      </div>

      {/* Media */}
      {post.mediaUrl && (
        <img src={post.mediaUrl} alt="Post media" className="w-full rounded-xl object-cover max-h-80 block" />
      )}

      {/* Body */}
      <p className="text-sm leading-relaxed">{bodyText}</p>

      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {hashtags.map(tag => (
            <Badge key={tag} variant="outline" className="text-primary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Interactions */}
      <div className="border-t border-border pt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <button
            onClick={onLike}
            className={cn(
              'flex items-center gap-1.5 text-[13px] transition-colors bg-transparent border-none cursor-pointer min-h-9',
              liked ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Heart className={cn('size-4', liked && 'fill-current')} />
            <span className={cn('font-semibold', liked ? 'text-primary' : 'text-foreground')}>
              {likeCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground">likes</span>
          </button>
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <MessageCircle className="size-4" />
            <span className="font-semibold text-foreground">{post.commentCount.toLocaleString()}</span>
            <span>comments</span>
          </div>
        </div>
        <button
          onClick={onSave}
          className={cn(
            'transition-colors bg-transparent border-none cursor-pointer p-1.5 min-h-9',
            saved ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
          aria-label={saved ? 'Unsave post' : 'Save post'}
        >
          <Bookmark className={cn('size-4', saved && 'fill-current')} />
        </button>
      </div>
    </div>
  );
}

interface CommentsPanelProps {
  comments: (CommentDetail & { localLiked?: boolean })[];
  loading: boolean;
  onLike: (id: string) => void;
  commentInput: string;
  onCommentChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  scrollToBottomTrigger: number;
  onAuthorClick: (userId: string) => void;
}

function CommentsPanel({
  comments,
  loading,
  onLike,
  commentInput,
  onCommentChange,
  onSend,
  sending,
  scrollToBottomTrigger,
  onAuthorClick,
}: CommentsPanelProps) {
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const { state } = useAuth();
  const initials = state.user?.username.slice(0, 2).toUpperCase() ?? 'ME';

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  useEffect(() => {
    if (scrollToBottomTrigger === 0) return;
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scrollToBottomTrigger]);

  return (
    <div className="flex flex-col flex-1 overflow-hidden min-h-0">
      {/* Scrollable comments list */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5">
          {loading && (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          )}
          {!loading && comments.length === 0 && <EmptyComments />}
          {!loading &&
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} onLike={onLike} onAuthorClick={onAuthorClick} />
            ))}
          <div ref={commentsEndRef} />
        </div>
      </ScrollArea>

      {/* Composer */}
      {!loading && (
        <>
          <Separator />
          <div className="flex items-end gap-2.5 p-3 shrink-0">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 relative">
              <textarea
                value={commentInput}
                onChange={e => onCommentChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment…"
                rows={1}
                className="w-full bg-muted border border-transparent rounded-full px-3.5 py-2 pr-10 text-[13px] text-foreground placeholder:text-muted-foreground resize-none outline-none leading-normal transition-colors focus:border-ring"
                style={{ fieldSizing: 'content' } as CSSProperties}
              />
              <button
                onClick={onSend}
                disabled={!commentInput.trim() || sending}
                className={cn(
                  'absolute right-2 bottom-1.5 size-7 rounded-full flex items-center justify-center transition-colors border-none cursor-pointer',
                  commentInput.trim()
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-transparent text-muted-foreground cursor-default',
                )}
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────

interface PostDetailModalProps {
  postId: string | null;
  open: boolean;
  onClose: () => void;
}

export function PostDetailModal({ postId, open, onClose }: PostDetailModalProps) {
  const { post, loading, error } = usePostDetail(postId);
  const { state } = useAuth();
  const userId = state.user?.id;
  const { navigateToProfile } = useProfileNavigation();

  const handleAuthorClick = (authorId: string) => {
    navigateToProfile(authorId);
  };

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState<(CommentDetail & { localLiked?: boolean })[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileTab, setMobileTab] = useState<'post' | 'comments'>('post');
  const [scrollToBottomTrigger, setScrollToBottomTrigger] = useState(0);

  const [likePost] = useMutation<LikePostMutationResponse, LikePostVariables>(LIKE_POST, {
    refetchQueries: [{ query: GET_POST_BY_ID, variables: { postId } }],
  });

  const [createComment] = useMutation<CreateCommentMutationResponse, CreateCommentVariables>(CREATE_COMMENT, {
    refetchQueries: [{ query: GET_POST_BY_ID, variables: { postId } }],
  });

  // Sync state when post data loads
  useEffect(() => {
    if (!post) return;
    const isLiked = !!userId && post.likes.some(l => l.author.id === userId);
    setLiked(isLiked);
    setLikeCount(post.likeCount);
    setComments(post.comments.map(c => ({ ...c, localLiked: false })));
  }, [post, userId]);

  // Reset tab on open
  useEffect(() => {
    if (open) setMobileTab('post');
  }, [open]);

  const handleLike = async () => {
    if (!postId) return;
    const next = !liked;
    setLiked(next);
    setLikeCount(c => c + (next ? 1 : -1));
    try {
      await likePost({ variables: { postId } });
    } catch {
      setLiked(!next);
      setLikeCount(c => c + (next ? -1 : 1));
      toast.error('Failed to update like');
    }
  };

  const handleCommentLike = (id: string) => {
    setComments(prev => prev.map(c => (c.id === id ? { ...c, localLiked: !c.localLiked } : c)));
  };

  const handleSend = async () => {
    if (!commentInput.trim() || sending || !postId) return;
    const body = commentInput.trim();
    setSending(true);
    setCommentInput('');
    try {
      const result = await createComment({ variables: { postId, body } });
      const newComment = result.data?.createComment.comment;
      if (newComment) {
        setComments(prev => [...prev, { ...newComment, localLiked: false }]);
        setScrollToBottomTrigger(t => t + 1);
      }
    } catch {
      setCommentInput(body);
      toast.error('Failed to post comment');
    } finally {
      setSending(false);
    }
  };

  const notFound = !loading && !error && post === null && !!postId;

  const header = (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0">
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none cursor-pointer rounded-lg px-2 py-1.5 min-h-9 -ml-1"
      >
        <ArrowLeft className="size-4.5" />
        <span className="hidden sm:inline">Back to feed</span>
      </button>
      <span className="text-sm font-semibold">Post</span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        className="text-muted-foreground size-8 rounded-full"
        aria-label="Close"
      >
        <X className="size-4" />
      </Button>
    </div>
  );

  // Mobile drag handle + close header (replaces the shared header on mobile)
  const mobileHeader = (
    <>
      <div className="flex justify-center pt-2.5 pb-1 shrink-0 sm:hidden">
        <div className="w-10 h-1 rounded-full bg-border" />
      </div>
      <div className="flex items-center justify-between px-4 pb-3 sm:hidden shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1 text-[13px] text-muted-foreground bg-transparent border-none cursor-pointer rounded-lg px-2 py-1.5 min-h-9"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          Close
        </button>
        <span className="text-sm font-semibold">Post</span>
        <div className="w-16" />
      </div>
    </>
  );

  const commentsTabLabel = !loading && post ? `Comments (${post.commentCount})` : 'Comments';

  const mobileTabs = (
    <div className="flex border-b border-border shrink-0 sm:hidden">
      {(['post', 'comments'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setMobileTab(tab)}
          className={cn(
            'flex-1 py-2.5 text-[13px] border-none bg-transparent cursor-pointer transition-colors border-b-2 -mb-px font-medium',
            mobileTab === tab
              ? 'text-primary border-primary font-semibold'
              : 'text-muted-foreground border-transparent',
          )}
        >
          {tab === 'post' ? 'Post' : commentsTabLabel}
        </button>
      ))}
    </div>
  );

  const desktopBody = (
    <div className="hidden sm:flex flex-1 overflow-hidden min-h-0">
      {/* Left — post content */}
      <ScrollArea className="flex-1 basis-1/2 border-r border-border">
        <div className="p-5">
          {loading && <PostDetailSkeleton />}
          {notFound && <NotFoundState onClose={onClose} />}
          {error && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground text-sm">
              <p>Failed to load post.</p>
            </div>
          )}
          {!loading && !notFound && !error && post && (
            <PostContentPanel
              post={post}
              liked={liked}
              likeCount={likeCount}
              saved={saved}
              onLike={handleLike}
              onSave={() => setSaved(v => !v)}
              onAuthorClick={handleAuthorClick}
            />
          )}
        </div>
      </ScrollArea>

      {/* Right — comments */}
      <div className="flex-1 basis-1/2 flex flex-col overflow-hidden min-h-0">
        <CommentsPanel
          comments={comments}
          loading={loading}
          onLike={handleCommentLike}
          commentInput={commentInput}
          onCommentChange={setCommentInput}
          onSend={handleSend}
          sending={sending}
          scrollToBottomTrigger={scrollToBottomTrigger}
          onAuthorClick={handleAuthorClick}
        />
      </div>
    </div>
  );

  const mobileBody = (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 sm:hidden">
      {mobileTab === 'post' ? (
        <ScrollArea className="flex-1">
          <div className="p-4 flex flex-col gap-4">
            {loading && <PostDetailSkeleton />}
            {notFound && <NotFoundState onClose={onClose} />}
            {!loading && !notFound && post && (
              <>
                <PostContentPanel
                  post={post}
                  liked={liked}
                  likeCount={likeCount}
                  saved={saved}
                  onLike={handleLike}
                  onSave={() => setSaved(v => !v)}
                  onAuthorClick={handleAuthorClick}
                />
                <button
                  onClick={() => setMobileTab('comments')}
                  className="w-full py-2.5 bg-muted border-none rounded-xl text-[13px] font-medium text-foreground cursor-pointer"
                >
                  View all comments →
                </button>
              </>
            )}
          </div>
        </ScrollArea>
      ) : (
        <CommentsPanel
          comments={comments}
          loading={loading}
          onLike={handleCommentLike}
          commentInput={commentInput}
          onCommentChange={setCommentInput}
          onSend={handleSend}
          sending={sending}
          scrollToBottomTrigger={scrollToBottomTrigger}
          onAuthorClick={handleAuthorClick}
        />
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          // Reset defaults
          'p-0 gap-0 flex flex-col overflow-hidden',
          // Mobile: bottom sheet
          'top-auto bottom-0 left-0 right-0 max-w-none w-full rounded-t-2xl rounded-b-none h-[92dvh] translate-x-0 translate-y-0',
          // SM+: centered two-panel dialog — tablet 720px, desktop 880px
          'sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2',
          'sm:max-w-[720px] lg:max-w-[880px] sm:h-auto sm:max-h-[calc(100dvh-32px)] lg:max-h-[calc(100dvh-48px)] sm:rounded-xl',
        )}
      >
        {mobileHeader}
        <div className="hidden sm:block">{header}</div>
        {mobileTabs}
        {mobileBody}
        {desktopBody}
      </DialogContent>
    </Dialog>
  );
}
