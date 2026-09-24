import { defineConfig, devices } from "@playwright/test";

// webServer builds and serves the production output so the real service worker is exercised.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
    {
      name: "firefox",
      use: { browserName: "firefox", viewport: devices["Pixel 5"].viewport },
      testMatch: "search.spec.ts",
      grep: /snaps open or hides|filters periods|until the ledger is focused|Budgets button/,
    },
  ],
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
