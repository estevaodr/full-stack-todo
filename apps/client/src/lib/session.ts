import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: Date;
  /** Backend JWT for API proxy calls; set on login/register */
  accessToken?: string;
}

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET || SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters');
}

const secretKey = new TextEncoder().encode(SESSION_SECRET);
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function encrypt(payload: SessionPayload): Promise<string> {
  const claims: Record<string, unknown> = {
    userId: payload.userId,
    email: payload.email,
    expiresAt: payload.expiresAt.getTime(),
  };
  if (payload.accessToken != null) claims.accessToken = payload.accessToken;
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    const expiresAt = payload.expiresAt;
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      expiresAt:
        typeof expiresAt === 'number'
          ? new Date(expiresAt)
          : (expiresAt as Date),
      accessToken: payload.accessToken as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function createSession(
  userId: string,
  email: string,
  accessToken?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ userId, email, expiresAt, accessToken });

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('session')?.value;
  return decrypt(cookie);
}
