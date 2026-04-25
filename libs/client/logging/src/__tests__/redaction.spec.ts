import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetRootLoggerForTests } from '../lib/logger';
import {
  REDACTED,
  redactHeadersSnapshot,
  redactPlainObject,
} from '../lib/redaction';

function installStdoutCapture() {
  const chunks: string[] = [];
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk, _enc?, cb?) => {
    chunks.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
    if (typeof cb === 'function') {
      cb();
    }
    return true;
  });
  return () =>
    chunks
      .join('')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>);
}

describe('redaction (US2 / SC-002)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    __resetRootLoggerForTests();
    process.env.NODE_ENV = 'production';
    process.env.LOG_FORMAT = 'json';
    process.env.LOG_LEVEL = 'info';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    __resetRootLoggerForTests();
  });

  it('redacts closed object keys at root and nested depth', () => {
    const out = redactPlainObject({
      password: 'secret-pass',
      token: 'tok',
      accessToken: 'at',
      refreshToken: 'rt',
      nested: { password: 'inner', safe: 'ok' },
    });
    expect(out['password']).toBe(REDACTED);
    expect(out['token']).toBe(REDACTED);
    expect(out['accessToken']).toBe(REDACTED);
    expect(out['refreshToken']).toBe(REDACTED);
    expect((out['nested'] as Record<string, unknown>)['password']).toBe(
      REDACTED
    );
    expect((out['nested'] as Record<string, unknown>)['safe']).toBe('ok');
  });

  it('redacts authorization and cookie headers case-insensitively', () => {
    const h = new Headers();
    h.set('Authorization', 'Bearer super-secret');
    h.set('cookie', 'session=abc');
    h.set('X-Other', 'visible');
    const snap = redactHeadersSnapshot(h);
    const lowerKeys = Object.fromEntries(
      Object.entries(snap).map(([k, v]) => [k.toLowerCase(), v])
    );
    expect(lowerKeys['authorization']).toBe(REDACTED);
    expect(lowerKeys['cookie']).toBe(REDACTED);
    expect(lowerKeys['x-other']).toBe('visible');
  });

  it('pino redact paths suppress secret substrings on stdout', async () => {
    const getLines = installStdoutCapture();
    const { getRootLogger } = await import('../lib/logger');
    getRootLogger().info({
      user: { password: 'must-not-appear', name: 'bob' },
    });
    const raw = JSON.stringify(getLines());
    expect(raw).not.toContain('must-not-appear');
    expect(raw).toContain('[Redacted]');
  });
});
