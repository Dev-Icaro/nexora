import { Monitor, Moon, Sun } from 'lucide-react';
import type { CSSProperties } from 'react';

import { cn } from '@/shared/lib/utils';
import type { ThemePreference } from '@/shared/types';

export type AppearanceOption = ThemePreference;

type AppearanceSectionProps = {
  value: AppearanceOption;
  onValueChange: (v: AppearanceOption) => void;
};

type ThemeCardProps = {
  option: AppearanceOption;
  label: string;
  selected: boolean;
  onSelect: () => void;
};

type PreviewChromeProps = {
  mode: 'light' | 'dark';
  icon?: 'light' | 'dark' | 'system';
  className?: string;
  style?: CSSProperties;
};

const previewIcons = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

function PreviewChrome({ mode, icon, className, style }: PreviewChromeProps) {
  const isLight = mode === 'light';
  const Icon = icon ? previewIcons[icon] : null;
  const surface = isLight ? '#f7f5f2' : '#1b1b1b';
  const sidebar = isLight ? '#f0ede8' : '#212121';
  const line = isLight ? '#d4cfc9' : '#383838';
  const iconColor = isLight ? '#8a8178' : '#8c8c8c';

  return (
    <div className={cn('relative flex h-full w-full', className)} style={{ background: surface, ...style }}>
      <div className="flex h-full w-1/3 flex-col gap-1.5 p-2" style={{ background: sidebar }}>
        {Icon ? (
          <Icon aria-hidden="true" className="mb-0.5 size-3.5 shrink-0" strokeWidth={2} style={{ color: iconColor }} />
        ) : (
          <div className="h-3.5" />
        )}
        <div className="h-1.5 w-3/4 rounded-full" style={{ background: line }} />
        <div className="h-1 w-1/2 rounded-full" style={{ background: line }} />
        <div className="h-1 w-2/3 rounded-full" style={{ background: line }} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        <div className="h-1.5 w-full rounded-full" style={{ background: line }} />
        <div className="h-1.5 w-4/5 rounded-full" style={{ background: line }} />
        <div className="h-1.5 w-3/5 rounded-full" style={{ background: line }} />
      </div>
    </div>
  );
}

function LightPreview() {
  return <PreviewChrome mode="light" icon="light" />;
}

function DarkPreview() {
  return <PreviewChrome mode="dark" icon="dark" />;
}

function SystemPreview() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      <PreviewChrome mode="dark" icon="system" className="absolute inset-0" />
      <PreviewChrome
        mode="light"
        icon="system"
        className="absolute inset-0"
        style={{ clipPath: 'polygon(0 0, 58% 0, 32% 100%, 0 100%)' }}
      />
    </div>
  );
}

function ThemeCard({ option, label, selected, onSelect }: ThemeCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-xl border cursor-pointer',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
        selected
          ? 'ring-2 ring-primary border-primary/40'
          : 'border-border bg-card hover:border-border/60 hover:bg-accent/30',
      )}
    >
      <div className="h-18 w-full overflow-hidden">
        {option === 'light' && <LightPreview />}
        {option === 'dark' && <DarkPreview />}
        {option === 'system' && <SystemPreview />}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <span className="text-sm font-medium">{label}</span>
        <span
          aria-hidden="true"
          className={cn(
            'size-2.5 rounded-full border-2 transition-colors duration-150',
            selected ? 'border-primary bg-primary' : 'border-muted-foreground bg-transparent',
          )}
        />
      </div>
    </button>
  );
}

export function AppearanceSection({ value, onValueChange }: AppearanceSectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-base font-semibold">Appearance</h2>
        <p className="text-[13px] text-muted-foreground mt-1">Choose how Nexora looks on this device.</p>
      </div>

      <div className="p-6">
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-4">
          <ThemeCard
            option="light"
            label="Light"
            selected={value === 'light'}
            onSelect={() => onValueChange('light')}
          />
          <ThemeCard option="dark" label="Dark" selected={value === 'dark'} onSelect={() => onValueChange('dark')} />
          <ThemeCard
            option="system"
            label="System"
            selected={value === 'system'}
            onSelect={() => onValueChange('system')}
          />
        </div>
      </div>
    </div>
  );
}
