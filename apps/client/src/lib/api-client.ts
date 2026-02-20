/**
 * Server-side API client. Uses API_URL (server-only env); do not use in client components.
 * Only imported by API route handlers (app/api/**) and tests. API_URL is never in the client bundle.
 */
const API_BASE = (process.env.API_URL ?? '').replace(/\/$/, '');

function buildUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

export async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const res = await fetch(url, init);

  if (!res.ok) {
    let message = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body?.error && typeof body.error === 'string') message = body.error;
    } catch {
      // ignore non-JSON body
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

/** Call backend with Bearer token (e.g. from session.accessToken). */
export async function fetchApiWithAuth<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${accessToken}`);
  return fetchApi<T>(path, { ...init, headers });
}
