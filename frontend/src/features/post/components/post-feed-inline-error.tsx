import { AlertTriangle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type PostFeedInlineErrorProps = {
  message: string;
  onRetry: () => void;
};

export function PostFeedInlineError({ message, onRetry }: PostFeedInlineErrorProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-4">
      <div className="flex min-w-0 items-center gap-2">
        <AlertTriangle className="size-4 shrink-0 text-destructive" />
        <p className="truncate text-sm text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
