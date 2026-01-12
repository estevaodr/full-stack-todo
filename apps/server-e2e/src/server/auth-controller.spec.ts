import axios, { AxiosError } from 'axios';
import { CreateUserDto } from '@full-stack-todo/server/data-access-todo';
import { LoginRequestDto, LoginResponseDto } from '@full-stack-todo/server/data-access-todo';

describe('POST /api/v1/auth/login', () => {
  let testUser: { id: string; email: string };
  let testPassword: string;
  let accessToken: string;

  beforeAll(async () => {
    // Setup: Create a test user for authentication tests
    testPassword = 'TestP@ssw0rd123!';
    const createUserData: CreateUserDto = {
      email: `test-auth-${Date.now()}@example.com`,
      password: testPassword,
    };

    const createUserResponse = await axios.post('/api/v1/users', createUserData);
    testUser = {
      id: createUserResponse.data.id,
      email: createUserResponse.data.email,
    };

    // Also get a valid access token for potential use in other tests
    const loginResponse = await axios.post<LoginResponseDto>('/api/v1/auth/login', {
      email: testUser.email,
      password: testPassword,
    });
    accessToken = loginResponse.data.access_token;
  });

  describe('successful login', () => {
    it('should return a JWT access token with valid credentials', async () => {
      const loginData: LoginRequestDto = {
        email: testUser.email,
        password: testPassword,
      };

      const response = await axios.post<LoginResponseDto>('/api/v1/auth/login', loginData);

      expect(response.status).toBe(201); // POST requests typically return 201 Created
      expect(response.data).toHaveProperty('access_token');
      expect(typeof response.data.access_token).toBe('string');
      expect(response.data.access_token.length).toBeGreaterThan(0);
    });

    it('should return a valid JWT token structure', async () => {
      const loginData: LoginRequestDto = {
        email: testUser.email,
        password: testPassword,
      };

      const response = await axios.post<LoginResponseDto>('/api/v1/auth/login', loginData);

      expect(response.status).toBe(201); // POST requests typically return 201 Created
      // JWT tokens have 3 parts separated by dots
      const tokenParts = response.data.access_token.split('.');
      expect(tokenParts.length).toBe(3);
    });
  });

  describe('invalid credentials', () => {
    it('should return 401 Unauthorized with wrong password', async () => {
      const loginData: LoginRequestDto = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };

      try {
        await axios.post('/api/v1/auth/login', loginData);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
        expect(axiosError.response?.data).toMatchObject({
          message: 'Email or password is invalid',
        });
      }
    });

    it('should return 401 Unauthorized with wrong email', async () => {
      const loginData: LoginRequestDto = {
        email: 'nonexistent@example.com',
        password: testPassword,
      };

      try {
        await axios.post('/api/v1/auth/login', loginData);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
        expect(axiosError.response?.data).toMatchObject({
          message: 'Email or password is invalid',
        });
      }
    });

    it('should return 401 Unauthorized with both wrong email and password', async () => {
      const loginData: LoginRequestDto = {
        email: 'nonexistent@example.com',
        password: 'WrongPassword123!',
      };

      try {
        await axios.post('/api/v1/auth/login', loginData);
        fail('Expected request to fail with 401');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(401);
        expect(axiosError.response?.data).toHaveProperty('message');
        expect(axiosError.response?.data).toMatchObject({
          message: 'Email or password is invalid',
        });
      }
    });
  });

  describe('validation errors', () => {
    it('should return 400 Bad Request with invalid email format', async () => {
      const loginData = {
        email: 'not-an-email',
        password: testPassword,
      };

      try {
        await axios.post('/api/v1/auth/login', loginData);
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 Bad Request with missing email', async () => {
      const loginData = {
        password: testPassword,
      };

      try {
        await axios.post('/api/v1/auth/login', loginData);
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });

    it('should return 400 Bad Request with missing password', async () => {
      const loginData = {
        email: testUser.email,
      };

      try {
        await axios.post('/api/v1/auth/login', loginData);
        fail('Expected request to fail with 400');
      } catch (error) {
        const axiosError = error as AxiosError;
        expect(axiosError.response?.status).toBe(400);
      }
    });
  });
});
