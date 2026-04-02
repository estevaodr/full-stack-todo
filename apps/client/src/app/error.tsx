'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger/client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to our Pino ingestion endpoint
    logger.error(
      { err: error, digest: error.digest },
      'Unhandled client component crash'
    );
  }, [error]);

  return (
    <div className="flex h-[100vh] w-full flex-col items-center justify-center p-4">
      <div className="mx-auto w-full max-w-md space-y-6 text-center">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">
          An unexpected error occurred. Our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
