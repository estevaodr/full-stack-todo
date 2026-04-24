import { randomUUID } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

/**
 * Parse `x-request-id` per specs/002-server-structured-logging/contracts/http-request-logging.md
 */
export function readXRequestId(req: IncomingMessage): string | undefined {
  const raw = req.headers['x-request-id'];
  const parts: string[] = [];
  if (Array.isArray(raw)) {
    for (const r of raw) {
      parts.push(...String(r).split(','));
    }
  } else if (raw != null) {
    parts.push(...String(raw).split(','));
  }
  for (const seg of parts) {
    const t = seg.trim();
    if (t) return t;
  }
  return undefined;
}

export function generateHttpReqId(req: IncomingMessage): string {
  return readXRequestId(req) ?? randomUUID();
}
