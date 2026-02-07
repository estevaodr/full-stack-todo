import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { API_BASE } from '../mocks/handlers';

describe('Test infrastructure', () => {
  it('runs Vitest', () => {
    expect(1).toBe(1);
  });

  it('has jest-dom matchers', () => {
    render(createElement('div', { role: 'generic' }, 'hello'));
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  it('intercepts API with MSW', async () => {
    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'any' }),
    });
    expect(res.ok).toBe(true);
    const data = (await res.json()) as { access_token: string };
    expect(data).toHaveProperty('access_token');
    expect(data.access_token).toBe('mock-jwt-token');
  });
});
