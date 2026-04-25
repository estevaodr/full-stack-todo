export const REDACTED = '[Redacted]' as const;

const MAX_DEPTH = 10;

/** Paths for pino `redact.paths` (nested object keys per contract depth). */
export function buildPinoRedactPaths(): string[] {
  const keys = ['password', 'token', 'accessToken', 'refreshToken'] as const;
  const paths: string[] = [];
  for (let depth = 0; depth <= MAX_DEPTH; depth++) {
    const prefix =
      depth === 0 ? '' : Array.from({ length: depth }, () => '*').join('.');
    for (const k of keys) {
      paths.push(prefix ? `${prefix}.${k}` : k);
    }
  }
  const headerSuffixes = [
    'authorization',
    'Authorization',
    'cookie',
    'Cookie',
  ] as const;
  for (const hk of headerSuffixes) {
    paths.push(`headers.${hk}`);
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
      const prefix = Array.from({ length: depth }, () => '*').join('.');
      paths.push(`${prefix}.headers.${hk}`);
    }
  }
  return paths;
}

const SENSITIVE_OBJECT_KEYS = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
]);

function redactObjectValue(value: unknown, depth: number): unknown {
  if (depth > MAX_DEPTH) {
    return value;
  }
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === 'object' && item !== null
        ? redactObjectValue(item, depth + 1)
        : item
    );
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_OBJECT_KEYS.has(k)) {
        out[k] = REDACTED;
      } else if (typeof v === 'object' && v !== null) {
        out[k] = redactObjectValue(v, depth + 1);
      } else {
        out[k] = v;
      }
    }
    return out;
  }
  return value;
}

/** Case-insensitive match for authorization / cookie */
export function redactHeadersSnapshot(
  headers: Headers
): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (lower === 'authorization' || lower === 'cookie') {
      out[key] = REDACTED;
    } else {
      out[key] = value;
    }
  });
  return out;
}

export function redactPlainObject<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  return redactObjectValue(obj, 0) as Record<string, unknown>;
}
