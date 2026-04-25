import { afterEach, describe, expect, it, vi } from 'vitest';
import { __resetRootLoggerForTests } from '../lib/logger';

describe('LOG_LEVEL at bootstrap (US4 / SC-005)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    __resetRootLoggerForTests();
    delete process.env['LOG_LEVEL'];
    process.env['LOG_LEVEL'] = 'info';
  });

  it('honors LOG_LEVEL=warn: info and above emit, debug does not', async () => {
    vi.restoreAllMocks();
    __resetRootLoggerForTests();
    process.env.NODE_ENV = 'production';
    process.env.LOG_FORMAT = 'json';
    process.env['LOG_LEVEL'] = 'warn';

    const writes: string[] = [];
    vi.spyOn(process.stdout, 'write').mockImplementation((chunk, _enc?, cb?) => {
      writes.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
      if (typeof cb === 'function') {
        cb();
      }
      return true;
    });

    const { getRootLogger } = await import('../lib/logger');
    const log = getRootLogger();
    log.debug('should-not-emit');
    log.info('should-not-emit-info');
    log.warn('should-emit-warn');
    log.error('should-emit-error');

    const text = writes.join('');
    expect(text).not.toContain('should-not-emit');
    expect(text).not.toContain('should-not-emit-info');
    expect(text).toContain('should-emit-warn');
    expect(text).toContain('should-emit-error');
  });
});
