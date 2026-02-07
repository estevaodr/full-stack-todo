import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './mocks/server';

// Session tests need SESSION_SECRET (min 32 chars) before lib/session loads
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  process.env.SESSION_SECRET = 'x'.repeat(32);
}
// Api-client and MSW handlers use same base URL
if (!process.env.API_URL) {
  process.env.API_URL = 'http://localhost:3333';
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
