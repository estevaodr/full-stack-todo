import { decodeJwt } from 'jose/jwt/decode';
import { NextRequest, NextResponse } from 'next/server';
import { getLogger, withLogging } from '@full-stack-todo/client/logging';
import { fetchApi } from '@/lib/api-client';
import { createSession } from '@/lib/session';
import { loginSchema } from '@/lib/validations';
import type { ITokenResponse } from '@full-stack-todo/shared/domain';

export const runtime = 'nodejs';

async function postLogin(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid email or password.' },
      { status: 400 }
    );
  }

  try {
    const { access_token } = await fetchApi<ITokenResponse>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      }
    );

    const payload = decodeJwt(access_token) as { sub: string; email: string };
    await createSession(payload.sub, payload.email, access_token);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    getLogger('auth/login').error({ err }, 'login failed');
    return NextResponse.json(
      { message: 'Invalid email or password.' },
      { status: 401 }
    );
  }
}

export const POST = withLogging(postLogin);
