import { test, expect } from "@playwright/test";
import { seedStore } from "./seed";

// Real offline test: load online so the service worker installs and precaches, then cut the
// network and reload. A correct offline PWA serves everything from cache — so NO request should
// hit the network and fail. This is what catches the "fonts not precached" bug: the primeicons
// woff2 isn't in the precache glob, so offline it 404s on the network and icons disappear.
test("app works fully offline after the service worker is installed", async ({ page, context }) => {
  await seedStore(page);

  await page.goto("/");
  // Wait for the SW to be active AND controlling the page (precache complete).
  await page.waitForFunction(async () => {
    if (!("serviceWorker" in navigator)) return false;
    await navigator.serviceWorker.ready;
    return !!navigator.serviceWorker.controller;
  });

  const failed: string[] = [];
  page.on("requestfailed", (r) => failed.push(r.url()));

  await context.setOffline(true);
  await page.reload();

  // The app must still render offline.
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(page.locator(".budgetlist-item").first()).toBeVisible();

  // Nothing critical may fail to load from cache. Fonts included — this is the assertion that
  // fails on the current build and passes once woff2 is added to the precache glob.
  const critical = failed.filter((u) => /\.(js|css|woff2?|ttf|eot)(\?|$)/i.test(u));
  expect(critical, `these assets were not cached for offline:\n${critical.join("\n")}`).toEqual([]);
});
