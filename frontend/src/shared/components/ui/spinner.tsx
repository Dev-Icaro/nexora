import { cn } from '@/shared/lib/utils';

type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeClasses = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <div
      className={cn('animate-spin rounded-full border-primary border-t-transparent', sizeClasses[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
