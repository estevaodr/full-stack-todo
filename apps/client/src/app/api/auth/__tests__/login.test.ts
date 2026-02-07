/**
 * @vitest-environment node
 */
import { SignJWT } from 'jose';
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../login/route';

const mockCreateSession = vi.fn();
const mockFetchApi = vi.fn();

vi.mock('@/lib/api-client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
}));
vi.mock('@/lib/session', () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
}));

async function createTestJWT(payload: { sub: string; email: string }) {
  const secret = new TextEncoder().encode('test-secret-at-least-32-chars');
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    mockCreateSession.mockReset();
    mockFetchApi.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and sets session on successful login', async () => {
    const token = await createTestJWT({
      sub: 'user-123',
      email: 'user@example.com',
    });
    mockFetchApi.mockResolvedValue({ access_token: token });

    const res = await POST(
      jsonRequest({ email: 'user@example.com', password: 'password123' })
    );

    expect(res.status).toBe(200);
    expect(mockFetchApi).toHaveBeenCalledWith(
      '/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(mockCreateSession).toHaveBeenCalledWith('user-123', 'user@example.com');
  });

  it('returns 401 with generic message on invalid credentials', async () => {
    mockFetchApi.mockRejectedValue(new Error('Unauthorized'));

    const res = await POST(
      jsonRequest({ email: 'user@example.com', password: 'wrong' })
    );
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.message).toBe('Email or password is invalid');
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('returns 400 on validation error (invalid email)', async () => {
    const res = await POST(
      jsonRequest({ email: 'not-an-email', password: 'password123' })
    );

    expect(res.status).toBe(400);
    expect(mockFetchApi).not.toHaveBeenCalled();
    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('returns 400 on validation error (empty password)', async () => {
    const res = await POST(
      jsonRequest({ email: 'user@example.com', password: '' })
    );

    expect(res.status).toBe(400);
    expect(mockFetchApi).not.toHaveBeenCalled();
    expect(mockCreateSession).not.toHaveBeenCalled();
  });
});
