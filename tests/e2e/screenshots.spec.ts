import { test, expect } from "@playwright/test";
import { seedStore } from "./seed";

test.beforeEach(async ({ page }) => {
  // Block the PWA service worker so screenshots always reflect the current build,
  // never a stale precached bundle. (offline.spec.ts keeps the SW on purpose.)
  await page.addInitScript(() => {
    const sw = (navigator as any).serviceWorker;
    if (sw) sw.register = () => Promise.reject(new Error("SW disabled in screenshot tests"));
  });
  await seedStore(page);
});

test("period list", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".budgetlist-item").first()).toBeVisible();
  await expect(page).toHaveScreenshot("list.png", { maxDiffPixelRatio: 0.01 });
});

test("budget detail — ledger view", async ({ page }) => {
  await page.goto("/budget/test-period-1");
  await expect(page.locator("textarea")).toBeVisible();
  await expect(page).toHaveScreenshot("ledger.png", { maxDiffPixelRatio: 0.01 });
});

test("budget detail — overview view", async ({ page }) => {
  await page.goto("/budget/test-period-1");
  await page.getByRole("button", { name: "Summary" }).click();
  await expect(page.locator(".overview")).toBeVisible();
  await expect(page).toHaveScreenshot("overview.png", { maxDiffPixelRatio: 0.01 });
});

test("import page", async ({ page }) => {
  await page.goto("/import");
  await expect(page.getByRole("heading", { name: "Import data from file" })).toBeVisible();
  await expect(page).toHaveScreenshot("import.png", { maxDiffPixelRatio: 0.01 });
});
