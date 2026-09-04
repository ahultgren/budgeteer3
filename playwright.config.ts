import { defineConfig, devices } from "@playwright/test";

// The suite runs against the PRODUCTION BUILD (not the dev server), because that is what
// deploys and what carries the real service worker + precache manifest — the only way to
// test offline honestly. After the Vite migration, only `webServer.command` changes
// (generate+preview -> vite build+preview); the specs and screenshots stay identical.
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
  // Emulate a phone — this is a mobile-first PWA.
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 5"] } }],
  webServer: {
    command: "npm run generate && npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
