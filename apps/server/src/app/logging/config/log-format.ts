export type ResolvedLogFormat = 'json' | 'pretty';

/**
 * Resolve stdout transport shape from NODE_ENV + LOG_FORMAT (already normalized by Joi).
 */
export function resolveLogFormat(
  nodeEnv: string | undefined,
  logFormat: string | undefined,
): ResolvedLogFormat {
  const fmt = (logFormat ?? 'auto').toLowerCase();
  if (fmt === 'json') return 'json';
  if (fmt === 'pretty') return 'pretty';
  return nodeEnv === 'production' ? 'json' : 'pretty';
}
