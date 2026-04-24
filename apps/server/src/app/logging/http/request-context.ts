import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContextStore = { reqId: string };

export const requestContext = new AsyncLocalStorage<RequestContextStore>();

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.reqId;
}

export function runWithRequestContext<T>(reqId: string, fn: () => T): T {
  return requestContext.run({ reqId }, fn);
}
