import { NextRequest, NextResponse } from 'next/server';
import { resolveCorrelationId } from '@/lib/correlation-id';
import { getSession } from '@/lib/session';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/register', '/'];

function withRequestIdHeaders(req: NextRequest): NextResponse {
  const id = resolveCorrelationId(req.headers.get('x-request-id'));
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', id);
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  res.headers.set('x-request-id', id);
  return res;
}

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith('/api/')) {
    return withRequestIdHeaders(req);
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route)
  );
  const isPublicRoute = publicRoutes.includes(path);

  const requestId = resolveCorrelationId(req.headers.get('x-request-id'));
  const traceId = req.headers.get('x-trace-id')?.trim() || crypto.randomUUID();

  const startTime = Date.now();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);
  requestHeaders.set('x-trace-id', traceId);

  const session = await getSession();

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (isProtectedRoute && !session?.userId) {
    response = NextResponse.redirect(new URL('/login', req.nextUrl));
  } else if (
    isPublicRoute &&
    session?.userId &&
    !path.startsWith('/dashboard')
  ) {
    response = NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }

  response.headers.set('x-request-id', requestId);
  response.headers.set('x-trace-id', traceId);

  const duration = Date.now() - startTime;
  const url = req.nextUrl.pathname + req.nextUrl.search;
  const clientIp = req.headers
    .get('x-forwarded-for')
    ?.split(',')[0]
    ?.trim();
  const userAgent = req.headers.get('user-agent') ?? undefined;

  const logPayload: Record<string, unknown> = {
    ingestKind: 'edge-access',
    msg: 'http_request_complete',
    method: req.method,
    url,
    statusCode: response.status,
    responseTimeMs: duration,
    requestId,
    traceId,
  };
  if (session?.userId) {
    logPayload['userId'] = session.userId;
  }
  if (clientIp) {
    logPayload['clientIp'] = clientIp;
  }
  if (userAgent) {
    logPayload['userAgent'] = userAgent;
  }

  void fetch(new URL('/api/logs', req.url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-request-id': requestId,
      'x-trace-id': traceId,
    },
    body: JSON.stringify(logPayload),
  }).catch(() => {
    /* Edge: no pino; swallow */
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
