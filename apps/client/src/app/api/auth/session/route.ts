import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@full-stack-todo/client/logging';
import { getSession } from '@/lib/session';

export const runtime = 'nodejs';

async function getSessionHandler(req: NextRequest) {
  void req;
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    userId: session.userId,
    email: session.email,
    expiresAt: session.expiresAt,
  });
}

export const GET = withLogging(getSessionHandler);
