import { Writable } from 'node:stream';

/** Writable sink for tests — pino writes NDJSON chunks here instead of fd 1. */
export class TestLogStream extends Writable {
  private readonly parts: string[] = [];

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.parts.push(chunk.toString('utf8'));
    callback();
  }

  raw(): string {
    return this.parts.join('');
  }
}
