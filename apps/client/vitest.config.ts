import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules',
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**',
        '**/*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(
        __dirname,
        '../../libs/client/logging/src/test-shims/server-only.ts'
      ),
      '@full-stack-todo/client/logging': path.resolve(
        __dirname,
        '../../libs/client/logging/src/index.ts'
      ),
      '@full-stack-todo/shared/domain': path.resolve(
        __dirname,
        '../../libs/shared/domain/src/index.ts'
      ),
    },
  },
});
