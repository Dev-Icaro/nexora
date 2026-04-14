import type { StrengthLevel } from '@/features/auth/utils/password-strength';
import { cn } from '@/shared/lib/utils';

const SEGMENT_COUNT = 4;

const levelStyles: Record<StrengthLevel, { bar: string; text: string }> = {
  weak: { bar: 'bg-destructive', text: 'text-destructive' },
  fair: { bar: 'bg-orange-400', text: 'text-orange-400' },
  good: { bar: 'bg-yellow-400', text: 'text-yellow-400' },
  strong: { bar: 'bg-green-500', text: 'text-green-500' },
};

type PasswordStrengthIndicatorProps = {
  score: number;
  level: StrengthLevel;
  label: string;
};

export function PasswordStrengthIndicator({ score, level, label }: PasswordStrengthIndicatorProps) {
  const filledCount = Math.ceil((score / 5) * SEGMENT_COUNT);
  const { bar, text } = levelStyles[level];

  return (
    <div data-slot="password-strength" className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: SEGMENT_COUNT }).map((_, i) => (
          <div
            key={i}
            className={cn('h-1.5 flex-1 rounded-full transition-colors', i < filledCount ? bar : 'bg-muted')}
          />
        ))}
      </div>
      <span className={cn('text-xs font-medium tabular-nums w-10 text-right', text)}>{label}</span>
    </div>
  );
}
