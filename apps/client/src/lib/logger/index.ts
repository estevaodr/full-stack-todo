import { logger as clientLogger } from './client';
import { logger as serverLogger } from './server';

// Export a unified interface
// On the server, this uses the real Pino logger
// On the client, this uses pino/browser
export const logger = typeof window === 'undefined' ? serverLogger : clientLogger;
