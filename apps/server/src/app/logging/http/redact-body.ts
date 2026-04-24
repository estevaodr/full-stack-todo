const REDACTED = '[Redacted]';

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/**
 * Depth-first own-key `password` redaction for JSON-like snapshots.
 * @see specs/002-server-structured-logging/contracts/redaction.md
 */
export function redactPasswordInValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map((v) => redactPasswordInValue(v));
  if (typeof value === 'object') {
    if (value instanceof Date || Buffer.isBuffer(value)) {
      return REDACTED;
    }
    if (!isPlainObject(value)) {
      return REDACTED;
    }
    const o = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(o)) {
      if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
      if (k === 'password') {
        out[k] = REDACTED;
      } else {
        out[k] = redactPasswordInValue(o[k]);
      }
    }
    return out;
  }
  return value;
}

export function truncateUtf8Json(value: unknown, maxBytes: number): unknown {
  const s = JSON.stringify(value);
  if (Buffer.byteLength(s, 'utf8') <= maxBytes) return value;
  let end = s.length;
  while (end > 0 && Buffer.byteLength(s.slice(0, end), 'utf8') > maxBytes) {
    end -= 1;
  }
  return { truncated: true, preview: `${s.slice(0, end)}[truncated]` };
}

export function redactPasswordSnapshot(value: unknown, maxUtf8Bytes: number): unknown {
  const redacted = redactPasswordInValue(value);
  return truncateUtf8Json(redacted, maxUtf8Bytes);
}
