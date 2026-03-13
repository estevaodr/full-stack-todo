import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/register', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Generate Request ID and trace ID
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  const traceId = req.headers.get('x-trace-id') ?? crypto.randomUUID();

  // Create start time for duration measurement
  const startTime = Date.now();

  const session = await getSession();

  let response = NextResponse.next();

  if (isProtectedRoute && !session?.userId) {
    response = NextResponse.redirect(new URL('/login', req.nextUrl));
  } else if (isPublicRoute && session?.userId && !path.startsWith('/dashboard')) {
    response = NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  // Inject IDs to response headers
  response.headers.set('x-request-id', requestId);
  response.headers.set('x-trace-id', traceId);

  // Measure and log duration (using console.log as middleware runs in Edge runtime, wait... pino might have issues in Edge)
  // NEXT_PUBLIC_... environment variables are the only ones available here
  const duration = Date.now() - startTime;
  
  // Create log payload
  const logPayload = {
    level: 'info',
    message: `HTTP ${req.method} ${path}`,
    bindings: {
      url: path,
      method: req.method,
      status: response.status,
      durationMs: duration,
      requestId,
      traceId,
      userId: session?.userId,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: req.headers.get('user-agent'),
    },
    timestamp: Date.now(),
  };

  // Fire-and-forget log shipping to our ingestion API (Edge runtime: no waitUntil on NextRequest)
  fetch(new URL('/api/logs', req.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logPayload),
  }).catch((err) => {
    console.error('Failed to transmit middleware logs', err);
  });

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
