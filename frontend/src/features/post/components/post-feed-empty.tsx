import { Inbox } from 'lucide-react';

export function PostFeedEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Inbox className="size-12 text-muted-foreground" />
      <div className="space-y-1 text-center">
        <h2 className="text-lg font-semibold">Nothing here yet</h2>
        <p className="max-w-xs text-sm text-muted-foreground">
          Follow people to see their posts, or be the first to post something.
        </p>
      </div>
    </div>
  );
}
