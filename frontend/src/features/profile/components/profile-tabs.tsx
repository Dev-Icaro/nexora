import { useState } from 'react';

import { cn } from '@/shared/lib/utils';

type Tab = 'posts' | 'media' | 'likes';

type ProfileTabsProps = {
  children: React.ReactNode;
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'posts', label: 'Posts' },
  { key: 'media', label: 'Media' },
  { key: 'likes', label: 'Likes' },
];

export function ProfileTabs({ children }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-2xl border border-border bg-card p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex-1 rounded-xl py-2 text-sm font-medium capitalize transition-all',
              activeTab === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'posts' && children}

      {activeTab === 'media' && (
        <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Media coming soon.
        </div>
      )}

      {activeTab === 'likes' && (
        <div className="rounded-2xl border border-border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
          Liked posts are private.
        </div>
      )}
    </div>
  );
}
