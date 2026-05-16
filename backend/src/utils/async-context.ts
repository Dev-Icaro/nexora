import { AsyncLocalStorage } from 'async_hooks';

interface RequestStore {
  transactionId: string;
  userId?: string;
}

const storage = new AsyncLocalStorage<RequestStore>();

/**
 * Returns the transaction ID bound to the current async context.
 *
 * @returns The transaction ID string, or `undefined` when called outside a request context.
 */
export function getTransactionId(): string | undefined {
  return storage.getStore()?.transactionId ?? 'SYSTEM';
}

/**
 * Returns the authenticated user ID bound to the current async context.
 *
 * @returns The user ID string, or `'#'` when no user is authenticated or outside a request context.
 */
export function getUserId(): string {
  return storage.getStore()?.userId ?? '#';
}

/**
 * Binds a user ID to the current async context store.
 * Must be called from within an active `runWithTransactionId` context.
 *
 * @param userId - The authenticated user ID to store.
 */
export function setUserId(userId: string): void {
  const store = storage.getStore();
  if (store) store.userId = userId;
}

/**
 * Runs `fn` within an async context that carries the given `transactionId`.
 * All async continuations spawned within `fn` (Promises, callbacks, timers) inherit the context.
 *
 * @param transactionId - The transaction ID to bind to the context.
 * @param fn - The function to run inside the context.
 * @returns The return value of `fn`.
 */
export function runWithTransactionId<T>(transactionId: string, fn: () => T): T {
  return storage.run({ transactionId }, fn);
}
