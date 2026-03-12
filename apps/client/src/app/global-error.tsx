'use client';

import { logger } from '@/lib/logger/client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Catch fatal errors. GlobalError is a special boundary that wraps the entire application
  // Note: it runs in the browser during CSR, but conceptually serves as the "app crashed completely" fallback
  logger.fatal(
    { err: error, digest: error.digest },
    'Fatal global-error crash trapped'
  );

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="mx-auto w-full max-w-md space-y-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">App Crash</h2>
            <p className="text-muted-foreground">
              A critical error occurred. We have recorded this incident.
            </p>
            <button
              onClick={() => reset()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
