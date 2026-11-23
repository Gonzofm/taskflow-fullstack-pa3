import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/api.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 300_000,
    fileParallelism: false,
    maxWorkers: 1,
  },
});
