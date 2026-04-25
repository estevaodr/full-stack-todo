import { AsyncLocalStorage } from 'async_hooks';

export type RequestContextStore = {
  requestId: string;
  startedAt: number;
};

const storage = new AsyncLocalStorage<RequestContextStore>();

export function runWithRequestContext<T>(
  store: RequestContextStore,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return storage.run(store, fn);
}

export function getRequestContext(): RequestContextStore | undefined {
  return storage.getStore();
}

export function getRequestIdFromStore(): string | undefined {
  return storage.getStore()?.requestId;
}
