import { BadgeCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { cn, formatCompactNumber } from '@/shared/lib/utils';

type UserProfileSectionProps = {
  avatarUrl?: string;
  name: string;
  isVerified?: boolean;
  role?: string;
  bio?: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
  onProfileClick?: () => void;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function UserProfileSection({ avatarUrl, name, isVerified, role, bio, stats, onProfileClick }: UserProfileSectionProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <button
        type="button"
        onClick={onProfileClick}
        disabled={!onProfileClick}
        className="rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none"
        aria-label={onProfileClick ? `View ${name}'s profile` : undefined}
      >
        <Avatar className="size-16">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="bg-primary/20 text-primary font-semibold text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
      </button>

      <div className="flex w-full flex-col items-center gap-1 px-2">
        <div className="flex max-w-full items-center gap-1">
          <span
            onClick={onProfileClick}
            className={cn('truncate text-base font-semibold', onProfileClick && 'cursor-pointer hover:underline')}
          >
            {name}
          </span>
          {isVerified && <BadgeCheck className="size-4 shrink-0 fill-blue-500 text-white" />}
        </div>

        {role && <span className="w-full truncate text-center text-xs text-muted-foreground">{role}</span>}

        {bio && <p className="line-clamp-3 text-center text-xs text-muted-foreground">{bio}</p>}
      </div>

      <div className="flex w-full items-center divide-x divide-border">
        <StatItem label="Posts" value={stats.posts} />
        <StatItem label="Followers" value={stats.followers} />
        <StatItem label="Following" value={stats.following} />
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-0.5">
      <span className="text-sm font-bold">{formatCompactNumber(value)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
