import 'server-only';

import pino, { type Logger } from 'pino';
import { buildPinoRedactPaths, REDACTED } from './redaction';
import { getRequestIdFromStore } from './request-context';
import { syslogSeverityFromPinoLevel } from './severity-map';

const ALLOWED_LEVELS = new Set([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
]);

let rootLogger: Logger | undefined;

function resolveLogFormat(): 'json' | 'pretty' {
  const raw = (process.env['LOG_FORMAT'] ?? 'auto').toLowerCase();
  if (raw === 'json') return 'json';
  if (raw === 'pretty') return 'pretty';
  if (raw === 'auto') {
    return process.env['NODE_ENV'] === 'production' ? 'json' : 'pretty';
  }
  return 'pretty';
}

function resolveLogLevel(): string {
  const raw = (process.env['LOG_LEVEL'] ?? 'info').toLowerCase();
  if (!ALLOWED_LEVELS.has(raw)) {
    throw new Error(
      `Invalid LOG_LEVEL "${process.env['LOG_LEVEL'] ?? ''}". Allowed: ${[...ALLOWED_LEVELS].join(', ')}`
    );
  }
  return raw;
}

function createRootLogger(): Logger {
  const level = resolveLogLevel();
  const format = resolveLogFormat();

  const baseOptions: pino.LoggerOptions = {
    level,
    redact: {
      paths: buildPinoRedactPaths(),
      censor: REDACTED,
    },
    mixin(_mergeObject: object, levelNum: number) {
      return { syslogSeverity: syslogSeverityFromPinoLevel(levelNum) };
    },
  };

  if (format === 'pretty') {
    return pino(
      baseOptions,
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      })
    );
  }

  return pino(baseOptions);
}

export function getRootLogger(): Logger {
  if (!rootLogger) {
    rootLogger = createRootLogger();
  }
  return rootLogger;
}

/** Vitest only — resets singleton between cases */
export function __resetRootLoggerForTests(): void {
  rootLogger = undefined;
}

export function getLogger(
  contextName: string,
  options?: { requestId?: string }
): Logger {
  const requestId = options?.requestId ?? getRequestIdFromStore();

  const bindings: Record<string, string> = { context: contextName };
  if (requestId) {
    bindings['requestId'] = requestId;
  }
  return getRootLogger().child(bindings);
}
