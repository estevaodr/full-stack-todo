import pino from 'pino';

export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  browser: {
    asObject: true,
    transmit: {
      level: 'info',
      send: (_level, logEvent) => {
        const msg = logEvent.messages[0];
        const payload = {
          level: logEvent.level.label,
          message: typeof msg === 'string' ? msg : JSON.stringify(msg),
          bindings: logEvent.bindings,
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
            // Unlikely to crash the app, but log it to console as a last resort
            console.error('Failed to transmit logs to /api/logs', err);
          });
        }
      },
    },
  },
});
