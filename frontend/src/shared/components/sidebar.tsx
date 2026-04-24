import type { LucideIcon } from 'lucide-react';
import { Home, Settings2 } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { cn } from '@/shared/lib/utils';

import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { UserProfileSection } from './user-profile-section';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  collapsed?: boolean;
}

function NavItem({ to, icon: Icon, label, end, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-lg text-sm font-medium transition-colors relative',
          collapsed ? 'justify-center p-2.5' : 'w-full gap-3 px-3 py-2',
          isActive ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
        )
      }
    >
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

interface SidebarProps {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const {
    state: { user },
  } = useAuth();
  const initials = user?.username.slice(0, 2).toUpperCase() ?? 'ME';

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 flex h-screen flex-col border-r border-sidebar bg-sidebar py-5 transition-[width] duration-200',
        collapsed ? 'w-16 px-2' : 'w-60 px-4',
      )}
    >
      {/* Logo */}
      <Link to="/" className={cn('flex items-center gap-2 mb-1', collapsed && 'justify-center')}>
        <img src="/logo.png" alt="Nexora" className="size-9 shrink-0" />
        {!collapsed && <span className="text-md font-semibold text-sidebar-foreground whitespace-nowrap">Nexora</span>}
      </Link>

      {/* Profile */}
      {collapsed ? (
        <div className="flex justify-center mt-3 mb-2">
          <Avatar className="size-10">
            <AvatarFallback className="bg-primary/20 text-primary font-semibold text-sm">{initials}</AvatarFallback>
          </Avatar>
        </div>
      ) : (
        <>
          <UserProfileSection
            name={user?.username ?? 'Unknown'}
            isVerified={true}
            role="College Doctor"
            bio="Guiding the next generation through the journey of health and knowledge!"
            stats={{ posts: 368, followers: 184300, following: 1040000 }}
          />
          <Separator />
        </>
      )}

      {/* Nav */}
      <nav className={cn('flex flex-col gap-0.5', collapsed ? 'mt-2' : 'mt-6')}>
        <NavItem to="/" icon={Home} label="Feed" end collapsed={collapsed} />
        <NavItem to="/settings" icon={Settings2} label="Settings" collapsed={collapsed} />
      </nav>

      <Separator className="mt-4" />
    </aside>
  );
}
