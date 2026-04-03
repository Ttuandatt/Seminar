import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['services/**/*.test.ts', 'utils/**/*.test.ts'],
    exclude: ['dist/**', 'node_modules/**'],
    globals: true,
  },
});
