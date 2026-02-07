import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/session';

export async function POST(_request: NextRequest) {
  await deleteSession();
  return NextResponse.json({ ok: true }, { status: 200 });
}
