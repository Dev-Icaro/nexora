import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-background px-4 py-6">
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="Nexora" className="size-10" />
        <span className="text-md font-semibold">Nexora</span>
      </Link>
    </aside>
  );
}
