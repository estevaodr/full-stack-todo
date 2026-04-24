import { redactPasswordInValue } from '../http/redact-body';

describe('redactPasswordInValue', () => {
  it('redacts nested password own-properties', () => {
    const out = redactPasswordInValue({
      user: { password: 'secret', name: 'a' },
      password: 'top',
    }) as Record<string, unknown>;
    expect(out.password).toBe('[Redacted]');
    expect((out.user as Record<string, unknown>).password).toBe('[Redacted]');
    expect((out.user as Record<string, unknown>).name).toBe('a');
  });

  it('redacts password inside array elements', () => {
    const out = redactPasswordInValue([{ password: 'x' }]) as unknown[];
    expect((out[0] as Record<string, unknown>).password).toBe('[Redacted]');
  });

  it('replaces non-plain objects with redacted marker (prototype chain not walked)', () => {
    const base = Object.create({ password: 'proto' });
    (base as { own: number }).own = 1;
    expect(redactPasswordInValue(base)).toBe('[Redacted]');
  });
});
