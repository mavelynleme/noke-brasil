import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  use: { baseURL: "http://localhost:3010", ...devices["Desktop Chrome"] },
  webServer: {
    command: "pnpm --filter @noke/web dev --port 3010",
    url: "http://localhost:3010/app",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
    env: { APP_DATA_MODE: "mock" },
  },
});
