import { HardDrive } from 'lucide-react';

import type { StorageInfo } from '@/features/profile/api/profile.types';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn, formatBytes } from '@/shared/lib/utils';

type StorageSectionProps = {
  storageInfo: StorageInfo | null;
};

function getIndicatorClassName(usedPercent: number): string {
  if (usedPercent >= 90) return 'bg-destructive';
  if (usedPercent >= 70) return 'bg-[oklch(0.78_0.17_85)]';
  return 'bg-[oklch(0.65_0.16_140)]';
}

function getPercentLabelClassName(usedPercent: number): string {
  if (usedPercent >= 90) return 'text-destructive';
  if (usedPercent >= 70) return 'text-[oklch(0.55_0.13_85)]';
  return 'text-muted-foreground';
}

export function StorageSection({ storageInfo }: StorageSectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-border">
        <h2 className="text-base font-semibold">Storage</h2>
        <p className="text-[13px] text-muted-foreground mt-1">Your media and file storage usage.</p>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {!storageInfo ? <StorageSectionSkeleton /> : <StorageSectionContent storageInfo={storageInfo} />}
      </div>
    </div>
  );
}

function StorageSectionContent({ storageInfo }: { storageInfo: StorageInfo }) {
  const { usedBytes, quotaBytes, remainingBytes, usedPercent } = storageInfo;
  const clamped = Math.min(Math.max(usedPercent, 0), 100);

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <HardDrive className="size-4 shrink-0" />
          <span>
            <span className="font-medium text-foreground">{formatBytes(usedBytes)}</span>
            {' of '}
            {formatBytes(quotaBytes)} used
          </span>
        </div>
        <span className={cn('text-xs font-medium tabular-nums', getPercentLabelClassName(clamped))}>
          {clamped.toFixed(1)}%
        </span>
      </div>

      <Progress
        value={clamped}
        max={100}
        aria-label="Storage used"
        indicatorClassName={getIndicatorClassName(clamped)}
      />

      <p className="text-[12px] text-muted-foreground">{formatBytes(remainingBytes)} remaining</p>
    </>
  );
}

function StorageSectionSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-3.5 w-28" />
    </>
  );
}
