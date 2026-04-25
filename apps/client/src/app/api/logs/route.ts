import { NextRequest, NextResponse } from 'next/server';
import {
  getLogger,
  getRootLogger,
  withLogging,
} from '@full-stack-todo/client/logging';
import { headers } from 'next/headers';
import { z } from 'zod';

export const runtime = 'nodejs';

const edgeAccessIngestSchema = z.object({
  ingestKind: z.literal('edge-access'),
  msg: z.literal('http_request_complete'),
  method: z.string(),
  url: z.string(),
  statusCode: z.number().int(),
  responseTimeMs: z.number().nonnegative(),
  requestId: z.string(),
  traceId: z.string().optional(),
  userId: z.string().optional(),
  clientIp: z.string().optional(),
  userAgent: z.string().optional(),
});

const browserLogSchema = z.object({
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const),
  message: z.string(),
  bindings: z.record(z.string(), z.any()).optional(),
  timestamp: z.number().optional(),
  url: z.string().optional(),
});

async function postLogs(_req: NextRequest) {
  const h = await headers();
  const traceIdHeader = h.get('x-trace-id') ?? undefined;

  try {
    const body: unknown = await _req.json();
    const edge = edgeAccessIngestSchema.safeParse(body);

    if (edge.success) {
      const d = edge.data;
      getRootLogger().info(
        {
          msg: 'http_request_complete',
          method: d.method,
          url: d.url,
          statusCode: d.statusCode,
          responseTimeMs: d.responseTimeMs,
          requestId: d.requestId,
          ...(d.traceId != null && d.traceId !== ''
            ? { traceId: d.traceId }
            : {}),
          ...(d.userId != null && d.userId !== '' ? { userId: d.userId } : {}),
          ...(d.clientIp != null && d.clientIp !== ''
            ? { clientIp: d.clientIp }
            : {}),
          ...(d.userAgent != null && d.userAgent !== ''
            ? { userAgent: d.userAgent }
            : {}),
          context: 'edge-middleware',
        },
        'http_request_complete'
      );
      return NextResponse.json({ success: true });
    }

    const browser = browserLogSchema.safeParse(body);
    if (!browser.success) {
      getRootLogger().warn(
        { err: browser.error, body },
        'Malformed log ingest payload'
      );
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const { level, message, bindings = {}, url } = browser.data;
    const log = getLogger('client-browser');
    const payload = {
      ...bindings,
      browserUrl: url,
      ...(traceIdHeader != null && traceIdHeader !== ''
        ? { traceId: traceIdHeader }
        : {}),
    };

    const logMethods = {
      trace: () => log.trace(payload, message),
      debug: () => log.debug(payload, message),
      info: () => log.info(payload, message),
      warn: () => log.warn(payload, message),
      error: () => log.error(payload, message),
      fatal: () => log.fatal(payload, message),
    } as const;

    logMethods[level]();

    return NextResponse.json({ success: true });
  } catch (error) {
    getRootLogger().error({ err: error }, 'Failed to ingest log');
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const POST = withLogging(postLogs);
