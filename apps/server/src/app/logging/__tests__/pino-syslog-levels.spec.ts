import pino from 'pino';

/** Golden table: specs/002-server-structured-logging/contracts/log-schema.md */
const TABLE: Array<{ label: pino.Level; num: number }> = [
  { label: 'trace', num: 10 },
  { label: 'debug', num: 20 },
  { label: 'info', num: 30 },
  { label: 'warn', num: 40 },
  { label: 'error', num: 50 },
  { label: 'fatal', num: 60 },
];

describe('pino numeric level ↔ label (RFC 5424 alignment)', () => {
  it.each(TABLE)('$label maps to $num', ({ label, num }) => {
    const lines: string[] = [];
    const dest = {
      write(chunk: string) {
        lines.push(chunk);
      },
    };
    const logger = pino({ level: label }, dest);
    (logger as unknown as Record<string, (o: object, m: string) => void>)[label](
      { probe: true },
      'x',
    );
    const row = JSON.parse(lines[0] as string) as { level: number };
    expect(row.level).toBe(num);
  });
});
