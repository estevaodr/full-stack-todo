import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { LogProvider } from '@/providers/LogProvider';
import { headers } from 'next/headers';
import { getSession } from '@/lib/session';
import { runWithContext } from '@/lib/logger/context';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const requestId = h.get('x-request-id') ?? undefined;
  const traceId = h.get('x-trace-id') ?? undefined;
  const session = await getSession();

  return runWithContext(
    { requestId, traceId, userId: session?.userId },
    () => (
      <html lang="en" suppressHydrationWarning>
        <body>
          <LogProvider initialSessionId={requestId} initialTraceId={traceId}>
            <QueryProvider>
              <ThemeProvider>
                <AuthProvider>{children}</AuthProvider>
              </ThemeProvider>
            </QueryProvider>
          </LogProvider>
        </body>
      </html>
    )
  );
}
