import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // tests/e2e belongs to Playwright
    include: ['src/**/*.test.ts', 'tests/unit/**/*.test.ts'],
  },
});
