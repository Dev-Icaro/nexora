import { AlertCircle } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';

type PostFeedErrorProps = {
  message: string;
  onRetry: () => void;
};

export function PostFeedError({ message, onRetry }: PostFeedErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <AlertCircle className="size-12 text-destructive" />
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Something went wrong</h2>
        <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
