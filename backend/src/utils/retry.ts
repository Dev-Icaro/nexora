/**
 * Executes an async operation with exponential-backoff retry on failure.
 *
 * @typeParam T - The resolved value type of the operation.
 * @param fn - The async function to call. Retried on any thrown error.
 * @param maxAttempts - Total number of attempts (including the first call). Defaults to `3`.
 * @param baseDelayMs - Delay before the second attempt in milliseconds. Doubles each retry. Defaults to `200`.
 * @returns A promise resolving to the return value of `fn` on success.
 * @throws The last error thrown by `fn` after all attempts are exhausted.
 */
export async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3, baseDelayMs = 200): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelayMs * 2 ** attempt));
      }
    }
  }

  throw lastError;
}
