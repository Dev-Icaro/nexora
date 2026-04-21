import { Card, CardContent } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';

export function PostCardSkeleton() {
  return (
    <Card className="bg-card border border-border rounded-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="size-8 rounded-md shrink-0" />
        </div>

        <Skeleton className="h-52 w-full rounded-xl" />

        <div className="space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-12 rounded-sm" />
            <Skeleton className="h-4 w-12 rounded-sm" />
            <Skeleton className="h-4 w-12 rounded-sm" />
          </div>
          <Skeleton className="size-4 rounded-sm" />
        </div>
      </CardContent>
    </Card>
  );
}
