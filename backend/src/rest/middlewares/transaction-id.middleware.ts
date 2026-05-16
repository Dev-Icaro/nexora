import { randomUUID } from 'crypto';
import type { NextFunction, Request as ExpressRequest, Response as ExpressResponse } from 'express';

import { runWithTransactionId } from '@/utils/async-context';

const TRANSACTION_ID_HEADERS = [
  'x-transaction-id',
  'x-request-id',
  'x-correlation-id',
  'x-trace-id',
  'x-b3-traceid',
  'request-id',
];

/**
 * Express middleware that binds a transaction ID to the async context of every request.
 * Reads from well-known headers in priority order; generates a random UUID if none are present.
 * The resolved ID is echoed back in the `x-transaction-id` response header.
 *
 * @param req - Incoming Express request.
 * @param res - Outgoing Express response.
 * @param next - Express next function.
 */
export function transactionIdMiddleware(req: ExpressRequest, res: ExpressResponse, next: NextFunction): void {
  let transactionId: string | undefined;

  for (const header of TRANSACTION_ID_HEADERS) {
    const value = req.headers[header];
    if (typeof value === 'string' && value) {
      transactionId = value;
      break;
    }
  }

  transactionId ??= randomUUID();
  res.setHeader('x-transaction-id', transactionId);
  runWithTransactionId(transactionId, next);
}
