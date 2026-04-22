import type { LucideIcon } from 'lucide-react';
import { Home, Settings2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/shared/lib/utils';

import { Separator } from './ui/separator';
import { UserProfileSection } from './user-profile-section';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

function NavItem({ to, icon: Icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
        )
      }
    >
      <Icon className="size-5 shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const {
    state: { user },
  } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 flex h-screen w-60 flex-col border-r border-sidebar bg-sidebar px-4 py-6">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Nexora" className="size-10" />
        <span className="text-md font-semibold text-sidebar-foreground">Nexora</span>
      </Link>

      <UserProfileSection
        name={user?.username ?? 'Unknown'}
        isVerified={true}
        role="College Doctor"
        bio="Guiding the next generation through the journey of health and knowledge!"
        stats={{ posts: 368, followers: 184300, following: 1040000 }}
      />

      <Separator />

      <nav className="mt-6 flex flex-col gap-1">
        <NavItem to="/" icon={Home} label="Feed" end />
        <NavItem to="/settings" icon={Settings2} label="Settings" />
      </nav>

      <Separator />
    </aside>
  );
}
