import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { __resetRootLoggerForTests } from '../lib/logger';
import { withLogging } from '../lib/with-logging';

function installStdoutCapture() {
  const chunks: string[] = [];
  const spy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk, _enc?, cb?) => {
    chunks.push(typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString());
    if (typeof cb === 'function') {
      cb();
    }
    return true;
  });
  const parsedLines = () =>
    chunks
      .join('')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => JSON.parse(l) as Record<string, unknown>);
  return { spy, parsedLines };
}

describe('withLogging (FR-010)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    __resetRootLoggerForTests();
    process.env['NODE_ENV'] = 'production';
    process.env['LOG_FORMAT'] = 'json';
    process.env['LOG_LEVEL'] = 'info';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    __resetRootLoggerForTests();
  });

  it('T013 Success: 200 + access fields on completion line', async () => {
    const { parsedLines } = installStdoutCapture();
    const handler = withLogging(async () =>
      NextResponse.json({ ok: true }, { status: 200 })
    );
    const req = new NextRequest('http://localhost/api/todos');
    const res = await handler(req);
    expect(res.status).toBe(200);
    const lines = parsedLines();
    const access = lines.find(
      (l) =>
        l['msg'] === 'http_request_complete' && l['method'] === 'GET'
    );
    expect(access).toBeDefined();
    expect(access?.['statusCode']).toBe(200);
    expect(access?.['requestId']).toEqual(expect.any(String));
    expect(access?.['url']).toBe('/api/todos');
    expect(access?.['responseTimeMs']).toEqual(expect.any(Number));
    expect(access?.['syslogSeverity']).toEqual(expect.any(Number));
  });

  it('T014 Error (a): throw → access statusCode 500 + rethrow', async () => {
    const { parsedLines } = installStdoutCapture();
    const boom = new Error('fail');
    const handler = withLogging(async () => {
      throw boom;
    });
    const req = new NextRequest('http://localhost/api/x');
    await expect(handler(req)).rejects.toThrow('fail');
    const access = parsedLines().find(
      (l) => l['msg'] === 'http_request_complete'
    );
    expect(access?.['statusCode']).toBe(500);
    expect(access?.['err']).toMatchObject({ message: 'fail' });
  });

  it('T015 Error (b): returned 404 without throw', async () => {
    const { parsedLines } = installStdoutCapture();
    const handler = withLogging(async () =>
      NextResponse.json({ not: 'found' }, { status: 404 })
    );
    const req = new NextRequest('http://localhost/api/missing');
    const res = await handler(req);
    expect(res.status).toBe(404);
    const access = parsedLines().find(
      (l) => l['msg'] === 'http_request_complete'
    );
    expect(access?.['statusCode']).toBe(404);
  });

  it('T016 preserves valid opaque ASCII x-request-id', async () => {
    const { parsedLines } = installStdoutCapture();
    const opaque = 'opaque-client-token-001';
    const handler = withLogging(async () =>
      NextResponse.json({ ok: true }, { status: 200 })
    );
    const req = new NextRequest('http://localhost/api/z', {
      headers: { 'x-request-id': opaque },
    });
    await handler(req);
    const access = parsedLines().find(
      (l) => l['msg'] === 'http_request_complete'
    );
    expect(access?.['requestId']).toBe(opaque);
  });
});
