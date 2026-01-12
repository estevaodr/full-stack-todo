import axios, { AxiosError } from 'axios';
import { CreateUserDto, UserResponseDto } from '@full-stack-todo/server/data-access-todo';
import { LoginRequestDto, LoginResponseDto } from '@full-stack-todo/server/data-access-todo';

describe('User Controller E2E Tests', () => {
  let testUser1: { id: string; email: string };
  let testUser2: { id: string; email: string };
  let testPassword: string;
  let accessToken1: string;
  let accessToken2: string;

  beforeAll(async () => {
    // Setup: Create two test users for testing user isolation
    testPassword = 'TestP@ssw0rd123!';
    
    // Create first test user
    const createUser1Data: CreateUserDto = {
      email: `test-user1-${Date.now()}@example.com`,
      password: testPassword,
    };
    const createUser1Response = await axios.post<UserResponseDto>('/api/v1/users', createUser1Data);
    testUser1 = {
      id: createUser1Response.data.id,
      email: createUser1Response.data.email,
    };

    // Create second test user
    const createUser2Data: CreateUserDto = {
      email: `test-user2-${Date.now()}@example.com`,
      password: testPassword,
    };
    const createUser2Response = await axios.post<UserResponseDto>('/api/v1/users', createUser2Data);
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
  });

  describe('POST /api/v1/users', () => {
    describe('create user', () => {
      it('should create a new user with valid data', async () => {
        const createUserData: CreateUserDto = {
          email: `new-user-${Date.now()}@example.com`,
          password: 'NewUserP@ssw0rd123!',
        };

        const response = await axios.post<UserResponseDto>('/api/v1/users', createUserData);

        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('id');
        expect(response.data).toHaveProperty('email', createUserData.email);
        expect(response.data).toHaveProperty('todos');
        expect(Array.isArray(response.data.todos)).toBe(true);
        expect(response.data.todos.length).toBe(0);
        // Password should not be in response
        expect(response.data).not.toHaveProperty('password');
      });

      it('should create a user and return valid UUID', async () => {
        const createUserData: CreateUserDto = {
          email: `uuid-test-${Date.now()}@example.com`,
          password: 'UuidTestP@ssw0rd123!',
        };

        const response = await axios.post<UserResponseDto>('/api/v1/users', createUserData);

        expect(response.status).toBe(201);
        // UUID format: 8-4-4-4-12 hexadecimal characters
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        expect(response.data.id).toMatch(uuidRegex);
      });
    });

    describe('validation errors', () => {
      it('should return 400 Bad Request with invalid email format', async () => {
        const createUserData = {
          email: 'not-an-email',
          password: 'ValidP@ssw0rd123!',
        };

        try {
          await axios.post('/api/v1/users', createUserData);
          fail('Expected request to fail with 400');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('should return 400 Bad Request with weak password', async () => {
        const createUserData = {
          email: `weak-password-${Date.now()}@example.com`,
          password: 'weak',
        };

        try {
          await axios.post('/api/v1/users', createUserData);
          fail('Expected request to fail with 400');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('should return 400 Bad Request with missing email', async () => {
        const createUserData = {
          password: 'ValidP@ssw0rd123!',
        };

        try {
          await axios.post('/api/v1/users', createUserData);
          fail('Expected request to fail with 400');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('should return 400 Bad Request with missing password', async () => {
        const createUserData = {
          email: `missing-password-${Date.now()}@example.com`,
        };

        try {
          await axios.post('/api/v1/users', createUserData);
          fail('Expected request to fail with 400');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('should return 400 Bad Request with empty email', async () => {
        const createUserData = {
          email: '',
          password: 'ValidP@ssw0rd123!',
        };

        try {
          await axios.post('/api/v1/users', createUserData);
          fail('Expected request to fail with 400');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });

      it('should return 400 Bad Request with empty password', async () => {
        const createUserData = {
          email: `empty-password-${Date.now()}@example.com`,
          password: '',
        };

        try {
          await axios.post('/api/v1/users', createUserData);
          fail('Expected request to fail with 400');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(400);
        }
      });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    describe('success', () => {
      it('should return user data when authenticated user requests their own ID', async () => {
        const response = await axios.get<UserResponseDto>(`/api/v1/users/${testUser1.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken1}`,
          },
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('id', testUser1.id);
        expect(response.data).toHaveProperty('email', testUser1.email);
        expect(response.data).toHaveProperty('todos');
        expect(Array.isArray(response.data.todos)).toBe(true);
        // Password should not be in response
        expect(response.data).not.toHaveProperty('password');
      });
    });

    describe('unauthorized', () => {
      it('should return 401 Unauthorized when no token is provided', async () => {
        try {
          await axios.get(`/api/v1/users/${testUser1.id}`);
          fail('Expected request to fail with 401');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(401);
        }
      });

      it('should return 401 Unauthorized when invalid token is provided', async () => {
        try {
          await axios.get(`/api/v1/users/${testUser1.id}`, {
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

      it('should return 404 Not Found when authenticated user tries to access another user\'s data', async () => {
        // User 1 tries to access User 2's data
        try {
          await axios.get(`/api/v1/users/${testUser2.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken1}`,
            },
          });
          fail('Expected request to fail with 404');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
          expect(axiosError.response?.data).toHaveProperty('message');
          expect(axiosError.response?.data).toMatchObject({
            message: 'User could not be found!',
          });
        }
      });

      it('should return 404 Not Found when User 2 tries to access User 1\'s data', async () => {
        // User 2 tries to access User 1's data
        try {
          await axios.get(`/api/v1/users/${testUser1.id}`, {
            headers: {
              Authorization: `Bearer ${accessToken2}`,
            },
          });
          fail('Expected request to fail with 404');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
          expect(axiosError.response?.data).toHaveProperty('message');
          expect(axiosError.response?.data).toMatchObject({
            message: 'User could not be found!',
          });
        }
      });
    });

    describe('not found', () => {
      it('should return 404 Not Found when requesting non-existent user ID', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        
        try {
          await axios.get(`/api/v1/users/${nonExistentId}`, {
            headers: {
              Authorization: `Bearer ${accessToken1}`,
            },
          });
          fail('Expected request to fail with 404');
        } catch (error) {
          const axiosError = error as AxiosError;
          expect(axiosError.response?.status).toBe(404);
          expect(axiosError.response?.data).toHaveProperty('message');
        }
      });

      it('should return 404 Not Found when requesting invalid UUID format', async () => {
        const invalidId = 'not-a-valid-uuid';
        
        try {
          await axios.get(`/api/v1/users/${invalidId}`, {
            headers: {
              Authorization: `Bearer ${accessToken1}`,
            },
          });
          fail('Expected request to fail with 404');
        } catch (error) {
          const axiosError = error as AxiosError;
          // Could be 404 or 400 depending on validation, but should fail
          expect([400, 404]).toContain(axiosError.response?.status);
        }
      });
    });
  });
});
