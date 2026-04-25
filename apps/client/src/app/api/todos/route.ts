import { NextRequest, NextResponse } from 'next/server';
import { getLogger, withLogging } from '@full-stack-todo/client/logging';
import { fetchApiWithAuth } from '@/lib/api-client';
import { getSession } from '@/lib/session';
import type { ITodo } from '@full-stack-todo/shared/domain';

export const runtime = 'nodejs';

async function getTodos(req: NextRequest) {
  void req;
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  getLogger('TodosRoute').info('fetching todos list');
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

async function postTodo(request: NextRequest) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: 'Invalid JSON' },
      { status: 400 }
    );
  }
  try {
    const todo = await fetchApiWithAuth<ITodo>(
      '/api/v1/todos',
      session.accessToken,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(todo, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to create todo' },
      { status: 502 }
    );
  }
}

export const GET = withLogging(getTodos);
export const POST = withLogging(postTodo);
