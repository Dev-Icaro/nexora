import { useParams } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { ProfileHeader } from '@/features/profile/components/profile-header';

const MOCK_USER = {
  name: 'Icaro Melo',
  isVerified: true,
  role: 'College Doctor',
  bio: 'Building Nexora one commit at a time. ☕',
  stats: { posts: 368, followers: 184_300, following: 512 },
};

export function ProfilePage() {
  const { username = '' } = useParams<{ username: string }>();
  const { state } = useAuth();
  const isOwnProfile = username === state.user?.username;

  const user = { ...MOCK_USER, username };

  return (
    <main className="max-w-2xl w-full mx-auto px-4 py-6">
      <ProfileHeader isOwnProfile={isOwnProfile} user={user} />
    </main>
  );
}
