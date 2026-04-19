import { Link } from 'react-router-dom';

import { UserProfileSection } from './user-profile-section';

const MOCK_PROFILE = {
  avatarUrl: undefined,
  name: 'Jessica Cambridge',
  isVerified: true,
  role: 'College Doctor',
  bio: 'Guiding the next generation through the journey of health and knowledge!',
  stats: { posts: 368, followers: 184300, following: 1040000 },
};

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-background px-4 py-6">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Nexora" className="size-10" />
        <span className="text-md font-semibold">Nexora</span>
      </Link>
      <UserProfileSection {...MOCK_PROFILE} />
    </aside>
  );
}
