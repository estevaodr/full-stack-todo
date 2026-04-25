import { decodeJwt } from 'jose/jwt/decode';
import { NextRequest, NextResponse } from 'next/server';
import { getLogger, withLogging } from '@full-stack-todo/client/logging';
import { fetchApi } from '@/lib/api-client';
import { createSession } from '@/lib/session';
import { registerBodySchema } from '@/lib/validations';
import type { IPublicUserData, ITokenResponse } from '@full-stack-todo/shared/domain';

export const runtime = 'nodejs';

async function postRegister(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const parsed = registerBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Registration failed. Please check your details.' },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;

  try {
    await fetchApi<IPublicUserData>('/api/v1/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const { access_token } = await fetchApi<ITokenResponse>(
      '/api/v1/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );

    const payload = decodeJwt(access_token) as { sub: string; email: string };
    await createSession(payload.sub, payload.email, access_token);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    getLogger('auth/register').error({ err }, 'register failed');
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Registration failed' },
      { status: 400 }
    );
  }
}

export const POST = withLogging(postRegister);
