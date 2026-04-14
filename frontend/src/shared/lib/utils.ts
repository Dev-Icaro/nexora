import type { ErrorLike } from '@apollo/client';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { ApiResponse } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getApiErrorMessage(
  error?: ErrorLike | null,
  data?: Record<string, ApiResponse | null | undefined> | null,
): string | undefined {
  const responseMessage = data ? !Object.values(data)[0]?.success && Object.values(data)[0]?.message : undefined;
  return responseMessage ?? error?.message;
}
