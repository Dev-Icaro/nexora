import { Link } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProfileNavigation } from '@/shared/hooks/use-profile-navigation';

import { Avatar, AvatarFallback } from './ui/avatar';

export function MobileTopBar() {
  const {
    state: { user },
  } = useAuth();
  const initials = user?.username.slice(0, 2).toUpperCase() ?? 'ME';
  const { navigateToProfile } = useProfileNavigation();

  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Nexora" className="size-7" />
        <span className="text-[15px] font-bold text-foreground">Nexora</span>
      </Link>
      <button
        type="button"
        onClick={() => user?.id && navigateToProfile(user.id)}
        className="rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="View your profile"
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{initials}</AvatarFallback>
        </Avatar>
      </button>
    </header>
  );
}
