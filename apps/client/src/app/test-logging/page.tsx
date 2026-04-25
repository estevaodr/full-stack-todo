import { logger } from '@/lib/logger/server';
import { ClientLogButton } from './ClientLogButton';

export default async function TestLoggingPage() {
  // Server-side log
  logger.info('TestLoggingPage: Rendering on server');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Logging Verification</h1>
      <p className="mb-4">Check the server console and browser network tab for log activity.</p>
      
      <div className="space-y-4">
        <ServerLogButton />
        <ClientLogButton />
      </div>
    </div>
  );
}

function ServerLogButton() {
  return (
    <div className="border p-4 rounded shadow-sm">
      <h2 className="font-semibold">Server-Side Log Trace</h2>
      <p className="text-sm text-gray-600 mb-2">
        A log was generated when this page rendered. It should have a <code>requestId</code> and <code>traceId</code> in the server console.
      </p>
    </div>
  );
}
