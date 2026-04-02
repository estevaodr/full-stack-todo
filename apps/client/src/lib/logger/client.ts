import pino from 'pino';

// pino/browser does not support logger.setBindings — we maintain context here manually.
const clientBindings: Record<string, unknown> = {};

export function setClientBindings(bindings: Record<string, unknown>): void {
  Object.assign(clientBindings, bindings);
}

export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  browser: {
    asObject: true,
    serialize: true,
    transmit: {
      level: 'error',
      send: (_level, logEvent) => {
        const msg = logEvent.messages[0];
        const payload = {
          level: logEvent.level.label,
          message: typeof msg === 'string' ? msg : JSON.stringify(msg),
          // Merge static pino bindings with our mutable context
          bindings: { ...logEvent.bindings[0], ...clientBindings },
          timestamp: logEvent.ts,
          url: typeof window !== 'undefined' ? window.location.href : '',
        };

        const body = JSON.stringify(payload);

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          navigator.sendBeacon('/api/logs', body);
        } else {
          fetch('/api/logs', {
            method: 'POST',
            body,
            headers: {
              'Content-Type': 'application/json',
            },
            keepalive: true,
          }).catch((err) => {
            console.error('Failed to transmit logs to /api/logs', err);
          });
        }
      },
    },
  },
});
