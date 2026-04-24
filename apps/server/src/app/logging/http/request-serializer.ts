import type { IncomingMessage } from 'node:http';
import { redactPasswordSnapshot } from './redact-body';

const BODY_PREVIEW_BYTES = 8192;

type ReqWithBody = IncomingMessage & {
  id?: unknown;
  body?: unknown;
};

/**
 * pino `serializers.req` — bounded body snapshot with password redaction; Authorization handled via pino `redact`.
 */
export function createReqSerializer() {
  return function serializeReq(req: ReqWithBody) {
    const headers = { ...req.headers };
    if (headers.authorization) {
      headers.authorization = '[Redacted]';
    }

    let body: unknown = undefined;
    const raw = req.body;
    if (raw !== undefined && raw !== null) {
      if (typeof raw === 'string') {
        body = { kind: 'string', omitted: true };
      } else if (Buffer.isBuffer(raw)) {
        body = { kind: 'buffer', omitted: true };
      } else if (typeof raw === 'object') {
        try {
          body = redactPasswordSnapshot(raw, BODY_PREVIEW_BYTES);
        } catch {
          body = { kind: 'object', parseError: true };
        }
      } else {
        body = raw;
      }
    }

    return {
      id: req.id,
      method: req.method,
      url: req.url,
      headers,
      remoteAddress: req.socket?.remoteAddress,
      remotePort: req.socket?.remotePort,
      ...(body !== undefined ? { body } : {}),
    };
  };
}
