import { AsyncLocalStorage } from 'async_hooks';

export type RequestContext = {
  requestId?: string;
  userId?: string;
  traceId?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getRequestContext() {
  return requestContext.getStore() || {};
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return requestContext.run(context, fn);
}
