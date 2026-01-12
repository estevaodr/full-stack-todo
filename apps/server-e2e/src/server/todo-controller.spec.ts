import axios, { AxiosError } from 'axios';
import { CreateUserDto } from '@full-stack-todo/server/data-access-todo';
import { LoginRequestDto, LoginResponseDto } from '@full-stack-todo/server/data-access-todo';
import { CreateTodoDto, UpdateTodoDto, UpsertTodoDto, TodoDto } from '@full-stack-todo/shared';
import { ITodo } from '@full-stack-todo/shared/domain';

describe('Todo Controller E2E Tests', () => {
  let testUser1: { id: string; email: string };
  let testUser2: { id: string; email: string };
  let testPassword: string;
  let accessToken1: string;
  let accessToken2: string;
  let user1Todo1: ITodo;
  let user1Todo2: ITodo;
  let user2Todo1: ITodo;

  beforeAll(async () => {
    // Setup: Create two test users for testing user isolation
    testPassword = 'TestP@ssw0rd123!';
    
    // Create first test user
    const createUser1Data: CreateUserDto = {
      email: `test-todo-user1-${Date.now()}@example.com`,
      password: testPassword,
    };
    const createUser1Response = await axios.post('/api/v1/users', createUser1Data);
    testUser1 = {
      id: createUser1Response.data.id,
      email: createUser1Response.data.email,
    };

    // Create second test user
    const createUser2Data: CreateUserDto = {
      email: `test-todo-user2-${Date.now()}@example.com`,
      password: testPassword,
    };
    const createUser2Response = await axios.post('/api/v1/users', createUser2Data);
    testUser2 = {
      id: createUser2Response.data.id,
      email: createUser2Response.data.email,
    };

    // Get access tokens for both users
    const login1Response = await axios.post<LoginResponseDto>('/api/v1/auth/login', {
      email: testUser1.email,
      password: testPassword,
    });
    accessToken1 = login1Response.data.access_token;

    const login2Response = await axios.post<LoginResponseDto>('/api/v1/auth/login', {
      email: testUser2.email,
      password: testPassword,
    });
    accessToken2 = login2Response.data.access_token;

    // Create some test todos for user 1
    const createTodo1Data: CreateTodoDto = {
      title: 'User 1 Todo 1',
      description: 'First todo for user 1',
    };
    const todo1Response = await axios.post<ITodo>('/api/v1/todos', createTodo1Data, {
      headers: {
        Authorization: `Bearer ${accessToken1}`,
      },
    });
    user1Todo1 = todo1Response.data;

    const createTodo2Data: CreateTodoDto = {
      title: 'User 1 Todo 2',
      description: 'Second todo for user 1',
    };
    const todo2Response = await axios.post<ITodo>('/api/v1/todos', createTodo2Data, {
      headers: {
        Authorization: `Bearer ${accessToken1}`,
      },
    });
    user1Todo2 = todo2Response.data;

    // Create a test todo for user 2
    const createUser2TodoData: CreateTodoDto = {
      title: 'User 2 Todo 1',
      description: 'First todo for user 2',
    };
    const user2TodoResponse = await axios.post<ITodo>('/api/v1/todos', createUser2TodoData, {
      headers: {
        Authorization: `Bearer ${accessToken2}`,
      },
    });
    user2Todo1 = user2TodoResponse.data;
  });

  describe('Unauthorized requests', () => {
    it('should return 401 Unauthorized for GET /api/v1/todos without token', async () => {
      try {
        await axios.get('/api/v1/todos');
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should return 401 Unauthorized for GET /api/v1/todos/:id without token', async () => {
      try {
        await axios.get(`/api/v1/todos/${user1Todo1.id}`);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should return 401 Unauthorized for POST /api/v1/todos without token', async () => {
      const createTodoData: CreateTodoDto = {
        title: 'Unauthorized Todo',
        description: 'This should fail',
      };
      try {
        await axios.post('/api/v1/todos', createTodoData);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should return 401 Unauthorized for PATCH /api/v1/todos/:id without token', async () => {
      const updateTodoData: UpdateTodoDto = {
        completed: true,
      };
      try {
        await axios.patch(`/api/v1/todos/${user1Todo1.id}`, updateTodoData);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should return 401 Unauthorized for PUT /api/v1/todos/:id without token', async () => {
      const upsertTodoData: UpsertTodoDto = {
        id: user1Todo1.id,
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true,
      };
      try {
        await axios.put(`/api/v1/todos/${user1Todo1.id}`, upsertTodoData);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should return 401 Unauthorized for DELETE /api/v1/todos/:id without token', async () => {
      try {
        await axios.delete(`/api/v1/todos/${user1Todo1.id}`);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });

    it('should return 401 Unauthorized with invalid token', async () => {
      try {
        await axios.get('/api/v1/todos', {
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        });
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
      }
    });
  });

  describe('User isolation', () => {
    it('should not allow User 1 to access User 2\'s todos in GET /api/v1/todos', async () => {
      const response = await axios.get<ITodo[]>('/api/v1/todos', {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      // User 1 should only see their own todos
      const todoIds = response.data.map(todo => todo.id);
      expect(todoIds).toContain(user1Todo1.id);
      expect(todoIds).toContain(user1Todo2.id);
      expect(todoIds).not.toContain(user2Todo1.id);
    });

    it('should not allow User 2 to access User 1\'s todos in GET /api/v1/todos', async () => {
      const response = await axios.get<ITodo[]>('/api/v1/todos', {
        headers: {
          Authorization: `Bearer ${accessToken2}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      // User 2 should only see their own todos
      const todoIds = response.data.map(todo => todo.id);
      expect(todoIds).toContain(user2Todo1.id);
      expect(todoIds).not.toContain(user1Todo1.id);
      expect(todoIds).not.toContain(user1Todo2.id);
    });

    it('should return 404 when User 1 tries to GET User 2\'s todo', async () => {
      try {
        await axios.get(`/api/v1/todos/${user2Todo1.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('should return 404 when User 2 tries to GET User 1\'s todo', async () => {
      try {
        await axios.get(`/api/v1/todos/${user1Todo1.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken2}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('should return 404 when User 1 tries to PATCH User 2\'s todo', async () => {
      const updateTodoData: UpdateTodoDto = {
        completed: true,
      };
      try {
        await axios.patch(`/api/v1/todos/${user2Todo1.id}`, updateTodoData, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('should return 404 when User 1 tries to DELETE User 2\'s todo', async () => {
      try {
        await axios.delete(`/api/v1/todos/${user2Todo1.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('GET /api/v1/todos', () => {
    it('should return all todos for the authenticated user', async () => {
      const response = await axios.get<ITodo[]>('/api/v1/todos', {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(2);
      
      // Verify structure of todos
      response.data.forEach(todo => {
        expect(todo).toHaveProperty('id');
        expect(todo).toHaveProperty('title');
        expect(todo).toHaveProperty('description');
        expect(todo).toHaveProperty('completed');
        expect(typeof todo.completed).toBe('boolean');
      });
    });

    it('should return empty array for user with no todos', async () => {
      // Create a new user with no todos
      const createUserData: CreateUserDto = {
        email: `empty-user-${Date.now()}@example.com`,
        password: testPassword,
      };
      const createUserResponse = await axios.post('/api/v1/users', createUserData);
      const newUserId = createUserResponse.data.id;

      const loginResponse = await axios.post<LoginResponseDto>('/api/v1/auth/login', {
        email: createUserResponse.data.email,
        password: testPassword,
      });
      const newUserToken = loginResponse.data.access_token;

      const response = await axios.get<ITodo[]>('/api/v1/todos', {
        headers: {
          Authorization: `Bearer ${newUserToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/todos/:id', () => {
    it('should return a single todo by ID for the authenticated user', async () => {
      const response = await axios.get<ITodo>(`/api/v1/todos/${user1Todo1.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', user1Todo1.id);
      expect(response.data).toHaveProperty('title', user1Todo1.title);
      expect(response.data).toHaveProperty('description', user1Todo1.description);
      expect(response.data).toHaveProperty('completed', user1Todo1.completed);
    });

    it('should return 404 for non-existent todo ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';
      try {
        await axios.get(`/api/v1/todos/${nonExistentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('POST /api/v1/todos', () => {
    it('should create a new todo for the authenticated user', async () => {
      const createTodoData: CreateTodoDto = {
        title: 'New Todo Item',
        description: 'This is a new todo created via E2E test',
      };

      const response = await axios.post<ITodo>('/api/v1/todos', createTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('title', createTodoData.title);
      expect(response.data).toHaveProperty('description', createTodoData.description);
      expect(response.data).toHaveProperty('completed', false);
      
      // Verify UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(response.data.id).toMatch(uuidRegex);
    });

    it('should return 400 Bad Request with missing title', async () => {
      const createTodoData = {
        description: 'Todo without title',
      };
      try {
        await axios.post('/api/v1/todos', createTodoData, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 Bad Request with missing description', async () => {
      const createTodoData = {
        title: 'Todo without description',
      };
      try {
        await axios.post('/api/v1/todos', createTodoData, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 Bad Request with empty title', async () => {
      const createTodoData: CreateTodoDto = {
        title: '',
        description: 'Valid description',
      };
      try {
        await axios.post('/api/v1/todos', createTodoData, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('PUT /api/v1/todos/:id (upsert)', () => {
    it('should update an existing todo when ID exists', async () => {
      const upsertTodoData: UpsertTodoDto = {
        id: user1Todo1.id,
        title: 'Updated Title via PUT',
        description: 'Updated Description via PUT',
        completed: true,
      };

      const response = await axios.put<ITodo>(`/api/v1/todos/${user1Todo1.id}`, upsertTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', user1Todo1.id);
      expect(response.data).toHaveProperty('title', upsertTodoData.title);
      expect(response.data).toHaveProperty('description', upsertTodoData.description);
      expect(response.data).toHaveProperty('completed', upsertTodoData.completed);
    });

    it('should create a new todo when ID does not exist', async () => {
      const newId = '550e8400-e29b-41d4-a716-446655440000';
      const upsertTodoData: UpsertTodoDto = {
        id: newId,
        title: 'New Todo via Upsert',
        description: 'Created via PUT upsert',
        completed: false,
      };

      const response = await axios.put<ITodo>(`/api/v1/todos/${newId}`, upsertTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', newId);
      expect(response.data).toHaveProperty('title', upsertTodoData.title);
      expect(response.data).toHaveProperty('description', upsertTodoData.description);
      expect(response.data).toHaveProperty('completed', upsertTodoData.completed);
    });

    it('should return 400 Bad Request with missing required fields', async () => {
      const upsertTodoData = {
        id: user1Todo1.id,
        title: 'Incomplete upsert',
        // Missing description and completed
      };
      try {
        await axios.put(`/api/v1/todos/${user1Todo1.id}`, upsertTodoData, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });

  describe('PATCH /api/v1/todos/:id (update)', () => {
    it('should partially update a todo (title only)', async () => {
      const updateTodoData: UpdateTodoDto = {
        title: 'Updated Title Only',
      };

      const response = await axios.patch<ITodo>(`/api/v1/todos/${user1Todo2.id}`, updateTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', user1Todo2.id);
      expect(response.data).toHaveProperty('title', updateTodoData.title);
      // Description should remain unchanged
      expect(response.data).toHaveProperty('description', user1Todo2.description);
    });

    it('should partially update a todo (completed status only)', async () => {
      const updateTodoData: UpdateTodoDto = {
        completed: true,
      };

      const response = await axios.patch<ITodo>(`/api/v1/todos/${user1Todo2.id}`, updateTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', user1Todo2.id);
      expect(response.data).toHaveProperty('completed', true);
    });

    it('should partially update a todo (multiple fields)', async () => {
      const updateTodoData: UpdateTodoDto = {
        title: 'Updated Title and Description',
        description: 'Updated description via PATCH',
        completed: false,
      };

      const response = await axios.patch<ITodo>(`/api/v1/todos/${user1Todo2.id}`, updateTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', user1Todo2.id);
      expect(response.data).toHaveProperty('title', updateTodoData.title);
      expect(response.data).toHaveProperty('description', updateTodoData.description);
      expect(response.data).toHaveProperty('completed', updateTodoData.completed);
    });

    it('should return 404 for non-existent todo ID', async () => {
      const updateTodoData: UpdateTodoDto = {
        completed: true,
      };
      const nonExistentId = '00000000-0000-0000-0000-000000000001';
      try {
        await axios.patch(`/api/v1/todos/${nonExistentId}`, updateTodoData, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/v1/todos/:id', () => {
    it('should delete a todo for the authenticated user', async () => {
      // First create a todo to delete
      const createTodoData: CreateTodoDto = {
        title: 'Todo to Delete',
        description: 'This todo will be deleted',
      };
      const createResponse = await axios.post<ITodo>('/api/v1/todos', createTodoData, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });
      const todoToDelete = createResponse.data;

      // Delete the todo
      const deleteResponse = await axios.delete(`/api/v1/todos/${todoToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken1}`,
        },
      });

      expect(deleteResponse.status).toBe(200);

      // Verify the todo is deleted
      try {
        await axios.get(`/api/v1/todos/${todoToDelete.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404 after deletion');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });

    it('should return 404 for non-existent todo ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000002';
      try {
        await axios.delete(`/api/v1/todos/${nonExistentId}`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });
        fail('Expected request to fail with 404');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(404);
      }
    });
  });
});
