import { test, expect } from "@playwright/test";
import { seedStore } from "./seed";

// Load online first so the service worker installs and precaches, then go offline and reload.
test("app works fully offline after the service worker is installed", async ({ page, context }) => {
  await seedStore(page);

  await page.goto("/");
  // Resolves once the SW controls the page, i.e. precaching is complete.
  await page.waitForFunction(async () => {
    if (!("serviceWorker" in navigator)) return false;
    await navigator.serviceWorker.ready;
    return !!navigator.serviceWorker.controller;
  });

  const failed: string[] = [];
  page.on("requestfailed", (r) => failed.push(r.url()));

  await context.setOffline(true);
  await page.reload();

  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(page.locator(".budgetlist-item").first()).toBeVisible();

  const critical = failed.filter((u) => /\.(js|css|woff2?|ttf|eot)(\?|$)/i.test(u));
  expect(critical, `these assets were not cached for offline:\n${critical.join("\n")}`).toEqual([]);
});
