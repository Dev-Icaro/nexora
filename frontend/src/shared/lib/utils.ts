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
