import { NextResponse } from 'next/server';
import { fetchApiWithAuth } from '@/lib/api-client';
import { getSession } from '@/lib/session';
import type { ITodo } from '@full-stack-todo/shared/domain';

export async function GET() {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const todos = await fetchApiWithAuth<ITodo[]>(
      '/api/v1/todos',
      session.accessToken
    );
    return NextResponse.json(todos);
  } catch {
    return NextResponse.json(
      { message: 'Failed to fetch todos' },
      { status: 502 }
    );
  }
}
