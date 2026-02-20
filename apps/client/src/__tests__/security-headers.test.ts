/**
 * Verifies next.config.js security headers. When the app runs, these headers
 * are sent on every response. Manual check in browser DevTools: Network tab →
 * select document request → Response Headers.
 */
import path from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextConfig = require(path.resolve(__dirname, '../../next.config.js'));

const EXPECTED_HEADERS = [
  'Strict-Transport-Security',
  'X-Frame-Options',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'Permissions-Policy',
];

describe('Security headers (next.config.js)', () => {
  it('config defines headers() that returns security headers for all routes', async () => {
    expect(nextConfig.headers).toBeDefined();
    expect(typeof nextConfig.headers).toBe('function');

    const result = await nextConfig.headers();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);

    const allRoutes = result.find((r: { source: string }) => r.source === '/(.*)');
    expect(allRoutes).toBeDefined();
    expect(Array.isArray(allRoutes.headers)).toBe(true);

    const keys = allRoutes.headers.map((h: { key: string }) => h.key);
    for (const expected of EXPECTED_HEADERS) {
      expect(keys).toContain(expected);
    }
  });

  it('each expected security header has a non-empty value', async () => {
    const result = await nextConfig.headers();
    const allRoutes = result.find((r: { source: string }) => r.source === '/(.*)');

    for (const expected of EXPECTED_HEADERS) {
      const header = allRoutes.headers.find((h: { key: string }) => h.key === expected);
      expect(header).toBeDefined();
      expect(header.value).toBeTruthy();
    }
  });
});
