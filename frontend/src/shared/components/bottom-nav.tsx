import type { LucideIcon } from 'lucide-react';
import { Bell, Home, MessageSquare, Settings2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/shared/lib/utils';

interface BottomNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

function BottomNavItem({ to, icon: Icon, label, end }: BottomNavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors border-none bg-transparent cursor-pointer',
          isActive ? 'text-primary' : 'text-muted-foreground',
        )
      }
    >
      <Icon className="size-5" />
      <span>{label}</span>
    </NavLink>
  );
}

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-[60px] items-stretch border-t border-border bg-card"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <BottomNavItem to="/" icon={Home} label="Feed" end />
      <BottomNavItem to="/messages" icon={MessageSquare} label="Messages" />
      <BottomNavItem to="/notifications" icon={Bell} label="Alerts" />
      <BottomNavItem to="/settings" icon={Settings2} label="Settings" />
    </nav>
  );
}
