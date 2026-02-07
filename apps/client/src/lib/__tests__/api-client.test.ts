import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchApi } from '@/lib/api-client';
import { API_BASE } from '@/mocks/handlers';
import { server } from '@/mocks/server';

describe('fetchApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET returns parsed JSON when response is ok', async () => {
    const data = await fetchApi<{ id: string }[]>('/api/v1/todos');
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('id');
    expect(data[0]).toHaveProperty('title');
  });

  it('POST with body returns parsed JSON when response is ok', async () => {
    const data = await fetchApi<{ access_token: string }>('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'any' }),
    });
    expect(data).toHaveProperty('access_token');
    expect(data.access_token).toBe('mock-jwt-token');
  });

  it('throws when response is not ok (e.g. 404)', async () => {
    server.use(
      http.get(`${API_BASE}/api/v1/not-found`, () =>
        HttpResponse.json({ error: 'Not found' }, { status: 404 })
      )
    );
    await expect(fetchApi('/api/v1/not-found')).rejects.toThrow();
  });

  it('throws when response is 500', async () => {
    server.use(
      http.get(`${API_BASE}/api/v1/error`, () =>
        HttpResponse.json({ error: 'Internal error' }, { status: 500 })
      )
    );
    await expect(fetchApi('/api/v1/error')).rejects.toThrow();
  });
});
