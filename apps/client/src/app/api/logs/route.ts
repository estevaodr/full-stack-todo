import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger/server';

const browserLogSchema = z.object({
  level: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const),
  message: z.string(),
  bindings: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
  url: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = browserLogSchema.safeParse(body);

    if (!result.success) {
      // In case of malformed payload, log a warning but don't reject
      logger.warn({ err: result.error, body }, 'Malformed browser log payload');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const { level, message, bindings = {}, url } = result.data;

    // Build the log context from the browser payload
    const logContext = {
      ...bindings,
      browserUrl: url,
      source: 'client-browser',
    };

    // Re-emit the log on the server Pino instance
    // Use the severity level from the payload, fallback to info if unknown level somehow
    if (level in logger && typeof logger[level] === 'function') {
      logger[level](logContext, message);
    } else {
      logger.info({ ...logContext, originalLevel: level }, message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // If we fail to parse json or anything else crashes the route
    logger.error({ err: error }, 'Failed to ingest browser log');
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
