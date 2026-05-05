import { ArrowUp } from 'lucide-react';

type NewPostsAnchorProps = {
  count: number;
  onClick: () => void;
};

export function NewPostsAnchor({ count, onClick }: NewPostsAnchorProps) {
  const label = count === 1 ? '1 new post' : `${count} new posts`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg cursor-pointer transition-opacity hover:opacity-90 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <ArrowUp className="size-4" />
      {label}
    </button>
  );
}
