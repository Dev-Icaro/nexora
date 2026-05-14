import { Spinner } from '@/shared/components/ui/spinner';

import { PostCardSkeleton } from './post-card-skeleton';

export function PostUploadingSkeleton() {
  return (
    <div className="relative">
      <PostCardSkeleton />
      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-card/50 backdrop-blur-[2px]">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
