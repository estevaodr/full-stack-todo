import { decodeJwt } from 'jose/jwt/decode';
import { NextRequest, NextResponse } from 'next/server';
import { fetchApi } from '@/lib/api-client';
import { createSession } from '@/lib/session';
import { loginSchema } from '@/lib/validations';
import type { ITokenResponse } from '@full-stack-todo/shared/domain';

export async function POST(request: NextRequest) {
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
      { errors: parsed.error.flatten().fieldErrors },
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
    await createSession(payload.sub, payload.email);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: 'Email or password is invalid' },
      { status: 401 }
    );
  }
}
