import { logger as clientLogger } from './client';
// @ts-expect-error - Will be alias resolved by Next.js if on client, or exist on server
import { logger as serverLogger } from './server';

// Export a unified interface
// On the server, this uses the real Pino logger
// On the client, this uses pino/browser
export const logger = typeof window === 'undefined' ? serverLogger : clientLogger;
