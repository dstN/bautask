import { defineConfig, devices } from '@playwright/test';

const port = 4321;
// PLAYWRIGHT_BASE_URL=https://bautask.yinside.de runs the suite against production.
const production = process.env['PLAYWRIGHT_BASE_URL'];

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: production ?? `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(production
    ? {}
    : {
        webServer: {
          // CI builds in a step of its own; locally the suite builds first
          command: `${process.env['CI'] ? '' : 'npm run build && '}npm run preview -- --host 127.0.0.1 --port ${port}`,
          url: `http://127.0.0.1:${port}/`,
          reuseExistingServer: !process.env['CI'],
          timeout: 120_000,
        },
      }),
});
