import 'server-only';

import type { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { getRootLogger } from './logger';
import { runWithRequestContext } from './request-context';

function accessUrl(req: NextRequest): string {
  return req.nextUrl.pathname + req.nextUrl.search;
}

function resolveRequestId(req: NextRequest): string {
  const raw = req.headers.get('x-request-id')?.trim();
  return raw || randomUUID();
}

/**
 * Wraps an App Router Route Handler with ALS, access logging, and FR-010 paths.
 * @see specs/003-nextjs-structured-logging/contracts/with-logging.md
 */
export function withLogging<
  TArgs extends [NextRequest, ...unknown[]],
>(
  handler: (...args: TArgs) => Promise<Response> | Response
): (...args: TArgs) => Promise<Response> | Response {
  const wrapped = async (...args: TArgs) => {
    const req = args[0] as NextRequest;
    const startedAt = Date.now();
    const requestId = resolveRequestId(req);
    const log = getRootLogger();
    const url = accessUrl(req);

    return runWithRequestContext({ requestId, startedAt }, async () => {
      try {
        const res = await handler(...args);
        const responseTimeMs = Date.now() - startedAt;
        const statusCode = res.status;
        log.info(
          {
            msg: 'http_request_complete',
            method: req.method,
            url,
            statusCode,
            responseTimeMs,
            requestId,
          },
          'http_request_complete'
        );
        return res;
      } catch (err) {
        const responseTimeMs = Date.now() - startedAt;
        const statusCode = 500;
        const errObj =
          err instanceof Error
            ? { type: 'Error', message: err.message, stack: err.stack }
            : { type: typeof err, value: String(err) };
        log.info(
          {
            msg: 'http_request_complete',
            method: req.method,
            url,
            statusCode,
            responseTimeMs,
            requestId,
            err: errObj,
          },
          'http_request_complete'
        );
        throw err;
      }
    });
  };
  return wrapped as (...args: TArgs) => Promise<Response> | Response;
}
