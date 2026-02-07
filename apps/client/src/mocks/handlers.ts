import { http, HttpResponse } from 'msw';
import type { ITodo, ITokenResponse, IPublicUserData } from '@full-stack-todo/shared/domain';

/**
 * Base URL for API requests. In tests, set API_URL to match this so the client
 * and MSW handlers use the same origin.
 */
export const API_BASE =
  typeof process !== 'undefined' && process.env?.API_URL
    ? process.env.API_URL.replace(/\/$/, '')
    : 'http://localhost:3333';

const api = (path: string) => `${API_BASE}/api/v1${path}`;

const mockUserId = 'mock-user-id';
const mockTodoId = 'mock-todo-id';

const mockUser: IPublicUserData = {
  id: mockUserId,
  email: 'test@example.com',
  todos: [],
};

const mockTodo: ITodo = {
  id: mockTodoId,
  title: 'Mock todo',
  description: 'Mock description',
  completed: false,
  user_id: mockUserId,
};

/**
 * MSW request handlers for auth and todo endpoints.
 * Used by setupServer() in tests to mock the NestJS backend API.
 */
export const handlers = [
  // Auth: POST /api/v1/auth/login
  http.post(api('/auth/login'), async () => {
    return HttpResponse.json<ITokenResponse>({
      access_token: 'mock-jwt-token',
    });
  }),

  // Users: POST /api/v1/users (register)
  http.post(api('/users'), async () => {
    return HttpResponse.json<IPublicUserData>(mockUser);
  }),

  // Users: GET /api/v1/users/:id
  http.get(api('/users/:id'), () => {
    return HttpResponse.json<IPublicUserData>(mockUser);
  }),

  // Todos: GET /api/v1/todos
  http.get(api('/todos'), () => {
    return HttpResponse.json<ITodo[]>([mockTodo]);
  }),

  // Todos: GET /api/v1/todos/:id
  http.get(api('/todos/:id'), ({ params }) => {
    return HttpResponse.json<ITodo>({
      ...mockTodo,
      id: String(params.id),
    });
  }),

  // Todos: POST /api/v1/todos
  http.post(api('/todos'), async ({ request }) => {
    const body = (await request.json()) as { title: string; description: string };
    return HttpResponse.json<ITodo>({
      id: `new-${mockTodoId}`,
      title: body?.title ?? mockTodo.title,
      description: body?.description ?? mockTodo.description,
      completed: false,
      user_id: mockUserId,
    });
  }),

  // Todos: PATCH /api/v1/todos/:id
  http.patch(api('/todos/:id'), async ({ params, request }) => {
    const body = (await request.json()) as Partial<ITodo>;
    return HttpResponse.json<ITodo>({
      ...mockTodo,
      id: String(params.id),
      ...body,
    });
  }),

  // Todos: PUT /api/v1/todos/:id (upsert)
  http.put(api('/todos/:id'), async ({ params, request }) => {
    const body = (await request.json()) as ITodo;
    return HttpResponse.json<ITodo>({
      ...mockTodo,
      ...body,
      id: String(params.id),
    });
  }),

  // Todos: DELETE /api/v1/todos/:id
  http.delete(api('/todos/:id'), () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
