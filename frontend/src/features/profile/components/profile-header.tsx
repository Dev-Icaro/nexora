import { BadgeCheck, Camera, MessageCircle, UserPlus } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import { formatCompactNumber } from '@/shared/lib/utils';

import { AvatarUploadModal } from './avatar-upload-modal';

type ProfileUser = {
  name: string;
  username: string;
  avatarUrl?: string;
  isVerified?: boolean;
  role?: string;
  bio?: string;
  stats: { posts: number; followers: number; following: number };
};

type ProfileHeaderProps = {
  isOwnProfile: boolean;
  user: ProfileUser;
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ProfileHeader({ isOwnProfile, user }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Cover band */}
      <div className="h-24 bg-linear-to-r from-primary/80 to-violet-600/80" />

      <div className="px-4 pb-4">
        {/* Avatar + action row */}
        <div className="flex items-end justify-between -mt-10 mb-3">
          {/* Avatar */}
          <div className="relative group">
            <Avatar className="size-20 ring-4 ring-card">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
              <AvatarFallback className="bg-primary/20 text-primary font-semibold text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setUploadOpen(true)}
                aria-label="Change avatar"
              >
                <Camera className="size-5 text-white" />
              </button>
            )}
          </div>

          {/* Action row */}
          <div className="flex gap-2">
            {isOwnProfile ? (
              <Button variant="outline" size="sm">
                Edit profile
              </Button>
            ) : (
              <>
                <Button size="sm" variant={isFollowing ? 'outline' : 'default'} onClick={() => setIsFollowing(f => !f)}>
                  <UserPlus className="size-4 mr-1.5" />
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="size-4 mr-1.5" />
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Identity block */}
        <div className="flex flex-col gap-0.5 mb-4">
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold leading-tight">{user.name}</span>
            {user.isVerified && <BadgeCheck className="size-5 shrink-0 fill-blue-500 text-white" />}
          </div>
          <span className="text-sm text-muted-foreground">@{user.username}</span>
          {user.role && <span className="text-sm text-muted-foreground">{user.role}</span>}
          {user.bio && <p className="text-sm mt-1">{user.bio}</p>}
        </div>

        {/* Stats bar */}
        <div className="flex items-center divide-x divide-border rounded-lg border border-border overflow-hidden">
          <StatItem label="Posts" value={user.stats.posts} />
          <StatItem label="Followers" value={user.stats.followers} />
          <StatItem label="Following" value={user.stats.following} />
        </div>
      </div>

      <AvatarUploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <button className="flex flex-1 flex-col items-center gap-0.5 py-3 hover:bg-muted/50 transition-colors">
      <span className="text-sm font-bold">{formatCompactNumber(value)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </button>
  );
}
