/**
 * Edge-safe `x-request-id` normalization per
 * specs/003-nextjs-structured-logging/contracts/middleware-request-id.md
 */
export function resolveCorrelationId(
  raw: string | null | undefined
): string {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) {
    return crypto.randomUUID();
  }
  if (trimmed.length < 1 || trimmed.length > 128) {
    return crypto.randomUUID();
  }
  for (let i = 0; i < trimmed.length; i++) {
    const c = trimmed.charCodeAt(i);
    if (c < 0x21 || c > 0x7e) {
      return crypto.randomUUID();
    }
  }
  return trimmed;
}
