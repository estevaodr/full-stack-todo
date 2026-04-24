import { resolveLogFormat } from '../config/log-format';

describe('resolveLogFormat', () => {
  it('forces json when LOG_FORMAT is json', () => {
    expect(resolveLogFormat('development', 'json')).toBe('json');
    expect(resolveLogFormat('production', 'json')).toBe('json');
  });

  it('forces pretty when LOG_FORMAT is pretty', () => {
    expect(resolveLogFormat('production', 'pretty')).toBe('pretty');
  });

  it('auto uses json in production', () => {
    expect(resolveLogFormat('production', 'auto')).toBe('json');
    expect(resolveLogFormat('production', undefined)).toBe('json');
  });

  it('auto uses pretty outside production', () => {
    expect(resolveLogFormat('development', 'auto')).toBe('pretty');
    expect(resolveLogFormat('development', undefined)).toBe('pretty');
    expect(resolveLogFormat(undefined, 'auto')).toBe('pretty');
  });
});
