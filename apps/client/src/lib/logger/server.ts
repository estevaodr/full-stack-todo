import 'server-only';
import pino from 'pino';
import { getRequestContext } from './context';

// RFC5424 Syslog severity levels: 
// 0: Emergency, 1: Alert, 2: Critical, 3: Error, 4: Warning, 5: Notice, 6: Informational, 7: Debug
const sysLogSeverityMap: Record<number, number> = {
  10: 7, // trace -> debug
  20: 7, // debug -> debug
  30: 6, // info -> info
  40: 4, // warn -> warning
  50: 3, // error -> error
  60: 2, // fatal -> critical
};

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  mixin() {
    return getRequestContext();
  },
  formatters: {
    level: (_label, number) => ({
      level: number,
      severity: sysLogSeverityMap[number] ?? 6, // Default to info
      facility: 16, // local0 facility
    }),
  },
  base: {
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'password',
      'token',
      'authorization',
    ],
    censor: '[REDACTED]',
  },
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});
