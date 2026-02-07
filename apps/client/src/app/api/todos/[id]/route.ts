import { NextRequest, NextResponse } from 'next/server';
import { fetchApiWithAuth } from '@/lib/api-client';
import { getSession } from '@/lib/session';
import type { ITodo } from '@full-stack-todo/shared/domain';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
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
      `/api/v1/todos/${id}`,
      session.accessToken,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );
    return NextResponse.json(todo);
  } catch {
    return NextResponse.json(
      { message: 'Failed to update todo' },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  try {
    const url = `${process.env.API_URL?.replace(/\/$/, '') ?? ''}/api/v1/todos/${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (!res.ok) throw new Error(String(res.status));
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { message: 'Failed to delete todo' },
      { status: 502 }
    );
  }
}
