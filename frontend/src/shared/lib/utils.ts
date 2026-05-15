import type { ErrorLike } from '@apollo/client';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ApiResponse } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(n: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function getApiErrorMessage(
  error?: ErrorLike | null,
  data?: Record<string, ApiResponse | null | undefined> | null,
): string | undefined {
  if (data) {
    const firstValue = Object.values(data)[0];
    if (!firstValue?.success) {
      return firstValue?.message ?? error?.message;
    }
  }

  return error?.message;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  const formatted = value % 1 === 0 ? value.toString() : value.toFixed(1).replace(/\.0$/, '');
  return `${formatted} ${units[i]}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
