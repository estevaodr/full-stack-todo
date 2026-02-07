import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node (Vitest). Use in test setup:
 * - beforeAll(() => server.listen())
 * - afterEach(() => server.resetHandlers())
 * - afterAll(() => server.close())
 *
 * Ensure API_URL in test env matches API_BASE in handlers.ts so requests are intercepted.
 */
export const server = setupServer(...handlers);
