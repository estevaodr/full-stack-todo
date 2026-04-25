/**
 * Documentation-only (v1): Server Components and `@full-stack-todo/client/logging`.
 *
 * - Do **not** rely on `AsyncLocalStorage` / `withLogging` in RSC — correlation is explicit.
 * - Prefer `export const dynamic = 'force-dynamic'` when you need `headers()` so `x-request-id`
 *   is available (static RSC cannot read request headers the same way).
 *
 * @example
 * ```tsx
 * import { headers } from 'next/headers';
 * import { randomUUID } from 'crypto';
 * import { getLogger } from '@full-stack-todo/client/logging';
 *
 * export const dynamic = 'force-dynamic';
 *
 * export default async function ExamplePage() {
 *   const h = await headers();
 *   const requestId = h.get('x-request-id') ?? randomUUID();
 *   getLogger('ExamplePage', { requestId }).info('server render');
 *   return null;
 * }
 * ```
 *
 * @see specs/003-nextjs-structured-logging/contracts/get-logger.md
 * @see specs/003-nextjs-structured-logging/quickstart.md
 */
export {};
