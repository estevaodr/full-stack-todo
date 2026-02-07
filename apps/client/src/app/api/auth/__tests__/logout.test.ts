/**
 * @vitest-environment node
 */
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../logout/route';

const mockDeleteSession = vi.fn();

vi.mock('@/lib/session', () => ({
  deleteSession: (...args: unknown[]) => mockDeleteSession(...args),
}));

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    mockDeleteSession.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 on successful logout', async () => {
    mockDeleteSession.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    });
    const res = await POST(req);

    expect(res.status).toBe(200);
  });

  it('clears session by calling deleteSession', async () => {
    mockDeleteSession.mockResolvedValue(undefined);

    const req = new NextRequest('http://localhost:3000/api/auth/logout', {
      method: 'POST',
    });
    await POST(req);

    expect(mockDeleteSession).toHaveBeenCalledTimes(1);
  });
});
