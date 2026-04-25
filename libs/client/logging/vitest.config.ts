import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.{spec,test}.ts', 'src/**/__tests__/**/*.ts'],
  },
  resolve: {
    alias: {
      'server-only': path.resolve(__dirname, './src/test-shims/server-only.ts'),
      '@full-stack-todo/client/logging': path.resolve(
        __dirname,
        './src/index.ts'
      ),
    },
  },
});
