import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/shared/components/sidebar';

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
