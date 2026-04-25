import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@full-stack-todo/client/logging';
import { deleteSession } from '@/lib/session';

export const runtime = 'nodejs';

async function postLogout(req: NextRequest) {
  void req;
  await deleteSession();
  return NextResponse.json({ ok: true }, { status: 200 });
}

export const POST = withLogging(postLogout);
