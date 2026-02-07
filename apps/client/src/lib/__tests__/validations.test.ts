import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../validations';

describe('loginSchema', () => {
  it('accepts valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('user@example.com');
      expect(result.data.password).toBe('anypassword');
    }
  });

  it('normalizes email to lowercase', () => {
    const result = loginSchema.safeParse({
      email: 'User@Example.COM',
      password: 'x',
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe('user@example.com');
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validRegistration = {
    email: 'newuser@example.com',
    password: 'SecureP4ss',
    confirmPassword: 'SecureP4ss',
  };

  it('accepts valid email, password, and matching confirmPassword', () => {
    const result = registerSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('newuser@example.com');
      expect(result.data.password).toBe('SecureP4ss');
    }
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'Short1',
      confirmPassword: 'Short1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'lowercase1',
      confirmPassword: 'lowercase1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without lowercase letter', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'UPPERCASE1',
      confirmPassword: 'UPPERCASE1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      password: 'NoNumbers',
      confirmPassword: 'NoNumbers',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when password and confirmPassword do not match', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'SecureP4ss',
      confirmPassword: 'DifferentP4ss',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      email: 'invalid',
    });
    expect(result.success).toBe(false);
  });
});
