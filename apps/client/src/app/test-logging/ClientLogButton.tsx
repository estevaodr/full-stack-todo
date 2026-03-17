"use client";

import { logger } from '@/lib/logger';

export function ClientLogButton() {
  const handleClick = () => {
    logger.info('TestLoggingPage: Client button clicked');
    logger.error({ error: new Error('Simulated client error') }, 'TestLoggingPage: Simulated error');
  };

  return (
    <div className="border p-4 rounded shadow-sm">
      <h2 className="font-semibold">Client-Side Log Trace</h2>
      <p className="text-sm text-gray-600 mb-2">
        Click the button to generate a client-side log and an error log. In production, the error log should be sent to <code>/api/logs</code>.
      </p>
      <button 
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Generate Client Logs
      </button>
    </div>
  );
}
