/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSession = vi.fn();

vi.mock('@/lib/session', () => ({
  getSession: (...args: unknown[]) => mockGetSession(...args),
}));

const middleware = (await import('../middleware')).default;

function request(pathname: string, origin = 'http://localhost:3000') {
  const req = new NextRequest(new URL(pathname, origin));
  // @ts-expect-error - NextRequest in test environment is missing waitUntil
  req.waitUntil = vi.fn();
  return req;
}

describe('middleware', () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    } as Response);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to /login when accessing protected route without session', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await middleware(request('/dashboard'));

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('http://localhost:3000/login');
  });

  it('redirects to /login when session is expired (getSession returns null)', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await middleware(request('/dashboard'));

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('http://localhost:3000/login');
  });

  it('allows access to protected route when session exists', async () => {
    mockGetSession.mockResolvedValue({
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(),
    });

    const res = await middleware(request('/dashboard'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Location')).toBeNull();
  });

  it('allows access to public route when no session', async () => {
    mockGetSession.mockResolvedValue(null);

    const res = await middleware(request('/login'));

    expect(res.status).toBe(200);
    expect(res.headers.get('Location')).toBeNull();
  });

  it('redirects to /dashboard when authenticated user visits /login', async () => {
    mockGetSession.mockResolvedValue({
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(),
    });

    const res = await middleware(request('/login'));

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('http://localhost:3000/dashboard');
  });

  it('redirects to /dashboard when authenticated user visits /', async () => {
    mockGetSession.mockResolvedValue({
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(),
    });

    const res = await middleware(request('/'));

    expect(res.status).toBe(307);
    expect(res.headers.get('Location')).toBe('http://localhost:3000/dashboard');
  });
});
