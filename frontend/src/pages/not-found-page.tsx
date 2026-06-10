import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '@/shared/hooks/use-page-title';

function BrokenGraph({ size = 300 }: { size?: number }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;

  const lostX = cx - r * 1.35 + Math.sin(tick * 0.04) * 4;
  const lostY = cy - r * 0.95 + Math.cos(tick * 0.05) * 3;

  const nodes = [
    { id: 0, x: cx, y: cy, filled: true, s: 12, lost: false },
    { id: 1, x: cx + r * Math.cos(-Math.PI / 2), y: cy + r * Math.sin(-Math.PI / 2), filled: true, s: 10, lost: false },
    { id: 2, x: cx + r * Math.cos(-Math.PI / 6), y: cy + r * Math.sin(-Math.PI / 6), filled: false, s: 9, lost: false },
    { id: 3, x: cx + r * Math.cos(Math.PI / 6), y: cy + r * Math.sin(Math.PI / 6), filled: true, s: 11, lost: false },
    { id: 4, x: cx + r * Math.cos(Math.PI / 2), y: cy + r * Math.sin(Math.PI / 2), filled: false, s: 9, lost: false },
    {
      id: 5,
      x: cx + r * Math.cos((5 * Math.PI) / 6),
      y: cy + r * Math.sin((5 * Math.PI) / 6),
      filled: true,
      s: 10,
      lost: false,
    },
    { id: 6, x: lostX, y: lostY, filled: false, s: 9, lost: true },
  ];

  const edges = [
    { a: 0, b: 1, broken: false },
    { a: 0, b: 2, broken: false },
    { a: 0, b: 3, broken: false },
    { a: 0, b: 4, broken: false },
    { a: 0, b: 5, broken: false },
    { a: 1, b: 2, broken: false },
    { a: 2, b: 3, broken: false },
    { a: 3, b: 4, broken: false },
    { a: 4, b: 5, broken: false },
    { a: 5, b: 6, broken: true },
    { a: 0, b: 6, broken: true },
  ];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="nf-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="nf-glow">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={size * 0.4} fill="url(#nf-glow)" />

      {edges.map((edge, i) => {
        const a = nodes[edge.a];
        const b = nodes[edge.b];
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={edge.broken ? 'oklch(0.55 0 0)' : 'url(#nf-edge)'}
            strokeWidth={edge.broken ? 1 : 1.5}
            strokeDasharray={edge.broken ? '3 5' : undefined}
            strokeOpacity={edge.broken ? 0.5 : 1}
          />
        );
      })}

      {nodes.map(node => (
        <g key={node.id}>
          {node.filled && <circle cx={node.x} cy={node.y} r={node.s + 4} fill="url(#nf-glow)" />}
          <circle
            cx={node.x}
            cy={node.y}
            r={node.s}
            fill={node.filled ? 'url(#nf-edge)' : 'oklch(0.16 0 0)'}
            stroke="url(#nf-edge)"
            strokeWidth={node.filled ? 0 : 1.75}
            opacity={node.lost ? 0.6 : 1}
          />
          {node.lost && (
            <>
              <circle
                cx={node.x}
                cy={node.y}
                r={node.s + 5}
                fill="none"
                stroke="oklch(0.55 0 0)"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.6"
              />
              <text
                x={node.x}
                y={node.y - node.s - 12}
                textAnchor="middle"
                fontFamily="var(--font-sans)"
                fontSize="10"
                fontWeight="600"
                fill="oklch(0.55 0 0)"
                letterSpacing="1"
              >
                404
              </text>
            </>
          )}
        </g>
      ))}
    </svg>
  );
}

export function NotFoundPage() {
  usePageTitle('Page not found');
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/login-background.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.45,
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 0%, oklch(0.11 0 0 / 70%) 70%)' }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="size-7" />
          <span className="text-[17px] font-semibold tracking-tight">Nexora</span>
        </div>
        <button className="cursor-pointer rounded-full border border-border bg-transparent px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          Help center
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-[18px] px-6 pb-8 text-center">
        <BrokenGraph size={300} />

        <div className="-mt-3 flex items-baseline gap-3.5" style={{ letterSpacing: '-0.04em' }}>
          <span className="text-[96px] font-bold leading-none">4</span>
          <div className="inline-flex h-[88px] w-[88px] items-center justify-center rounded-full border-2 border-dashed border-[oklch(0.55_0_0)] p-1 text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-muted-foreground">
            node
            <br />
            missing
          </div>
          <span className="text-[96px] font-bold leading-none">4</span>
        </div>

        <h1 className="text-[22px] font-semibold tracking-tight">This page slipped off the network.</h1>
        <p className="max-w-[380px] text-sm leading-relaxed text-muted-foreground">
          We can&apos;t find what you were looking for. Head back to the feed and we&apos;ll keep your connection warm.
        </p>

        <div className="mt-1.5 flex gap-2.5">
          <button
            onClick={() => navigate('/')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-[22px] py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
            </svg>
            Back to feed
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-transparent px-[22px] py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            </svg>
            Reload
          </button>
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between px-8 py-5 text-xs text-muted-foreground">
        <span>
          error code:{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">NX_404_NODE_NOT_FOUND</code>
        </span>
        <span className="flex gap-[18px]">
          <a href="#" className="transition-colors hover:text-foreground">
            status
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            support
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            terms
          </a>
        </span>
      </footer>
    </div>
  );
}
