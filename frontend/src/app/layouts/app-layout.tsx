import { Outlet } from 'react-router-dom';

import { BottomNav } from '@/shared/components/bottom-nav';
import { MobileTopBar } from '@/shared/components/mobile-top-bar';
import { Sidebar } from '@/shared/components/sidebar';
import { useBreakpoint } from '@/shared/hooks/use-breakpoint';
import { cn } from '@/shared/lib/utils';

export function AppLayout() {
  const bp = useBreakpoint();
  const isMobile = bp === 'mobile';
  const isTablet = bp === 'tablet';

  return (
    <div className="flex h-screen overflow-hidden">
      {!isMobile && <Sidebar collapsed={isTablet} />}

      <div className={cn('flex flex-1 flex-col overflow-hidden min-w-0', !isMobile && (isTablet ? 'ml-16' : 'ml-60'))}>
        {isMobile && <MobileTopBar />}

        {/* Scrollable content area */}
        <div className={cn('flex-1 overflow-y-auto', isMobile && 'pb-20')}>
          <Outlet />
        </div>

        {isMobile && <BottomNav />}
      </div>
    </div>
  );
}
