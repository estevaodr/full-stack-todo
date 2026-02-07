/**
 * @vitest-environment node
 * Session tests use jose (JWT); Node env ensures TextEncoder/Uint8Array work correctly.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockCookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookieStore),
}));

import {
  createSession,
  decrypt,
  deleteSession,
  encrypt,
  getSession,
  type SessionPayload,
} from '../session';

describe('encrypt', () => {
  it('returns a non-empty string (JWT)', async () => {
    const payload: SessionPayload = {
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 86400000),
    };
    const token = await encrypt(payload);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    expect(token.split('.')).toHaveLength(3);
  });
});

describe('decrypt', () => {
  it('returns payload when given valid token from encrypt', async () => {
    const payload: SessionPayload = {
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 86400000),
    };
    const token = await encrypt(payload);
    const result = await decrypt(token);
    expect(result).not.toBeNull();
    if (result) {
      expect(result.userId).toBe(payload.userId);
      expect(result.email).toBe(payload.email);
      expect(result.expiresAt).toBeDefined();
    }
  });

  it('returns null when token is undefined', async () => {
    const result = await decrypt(undefined);
    expect(result).toBeNull();
  });

  it('returns null when token is invalid', async () => {
    const result = await decrypt('not-a-valid-jwt');
    expect(result).toBeNull();
  });

  it('returns null when token is tampered', async () => {
    const payload: SessionPayload = {
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 86400000),
    };
    const token = await encrypt(payload);
    const tampered = token.slice(0, -2) + 'xx';
    const result = await decrypt(tampered);
    expect(result).toBeNull();
  });
});

describe('createSession', () => {
  beforeEach(() => {
    mockCookieStore.set.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets session cookie with encrypted payload', async () => {
    await createSession('user-1', 'user@example.com');
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      })
    );
    const token = mockCookieStore.set.mock.calls[0][1];
    const session = await decrypt(token);
    expect(session).not.toBeNull();
    if (session) {
      expect(session.userId).toBe('user-1');
      expect(session.email).toBe('user@example.com');
    }
  });
});

describe('deleteSession', () => {
  beforeEach(() => {
    mockCookieStore.delete.mockClear();
  });

  it('deletes session cookie', async () => {
    await deleteSession();
    expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
  });
});

describe('getSession', () => {
  beforeEach(() => {
    mockCookieStore.get.mockReset();
  });

  it('returns null when no session cookie', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const result = await getSession();
    expect(result).toBeNull();
  });

  it('returns payload when session cookie is valid', async () => {
    const payload: SessionPayload = {
      userId: 'user-1',
      email: 'user@example.com',
      expiresAt: new Date(Date.now() + 86400000),
    };
    const token = await encrypt(payload);
    mockCookieStore.get.mockReturnValue({ value: token });
    const result = await getSession();
    expect(result).not.toBeNull();
    if (result) {
      expect(result.userId).toBe('user-1');
      expect(result.email).toBe('user@example.com');
    }
  });
});
