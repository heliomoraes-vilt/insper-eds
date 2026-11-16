// Testes dos blocos portados do portal, no preview local (ver docs/porte-aem-eds.md).
import { defineConfig, devices } from '@playwright/test';

const PORT = 3920;

export default defineConfig({
  testDir: 'test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    colorScheme: 'light',
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], colorScheme: 'light', viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `node test/serve.mjs . ${PORT}`,
    port: PORT,
    reuseExistingServer: true,
  },
});
