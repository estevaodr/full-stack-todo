import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetRootLoggerForTests } from '../lib/logger';

describe('log format (US3 / SC-003)', () => {
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

  it('emits one JSON object per line with SC-003 required fields', async () => {
    const lines: string[] = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk, _enc?, cb?) => {
      lines.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
      if (typeof cb === 'function') {
        cb();
      }
      return true;
    });

    const { getRootLogger } = await import('../lib/logger');
    getRootLogger().info({ requestId: 'rid-1' }, 'hello-ndjson');

    const joined = lines.join('').trim();
    expect(joined.split('\n').length).toBe(1);
    const obj = JSON.parse(joined) as Record<string, unknown>;
    expect(obj['level']).toEqual(expect.any(Number));
    expect(obj['syslogSeverity']).toEqual(expect.any(Number));
    expect(obj['time']).toBeDefined();
    expect(obj['msg']).toBe('hello-ndjson');
    expect(obj['requestId']).toBe('rid-1');
  });
});
