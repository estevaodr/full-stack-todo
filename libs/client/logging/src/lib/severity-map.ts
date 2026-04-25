/**
 * Pino numeric levels: trace 10, debug 20, info 30, warn 40, error 50, fatal 60
 * @see specs/003-nextjs-structured-logging/contracts/log-schema.md
 */
export function syslogSeverityFromPinoLevel(level: number): number {
  if (level >= 60) return 2;
  if (level >= 50) return 3;
  if (level >= 40) return 4;
  if (level >= 30) return 6;
  if (level >= 20) return 7;
  return 7;
}
