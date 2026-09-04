import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixturePath = fileURLToPath(new URL("./fixtures/backup.json", import.meta.url));
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

// The core data-safety guarantee: what you import, persist, and export must be identical.
// This is the single most important integration test for the migration — if data survives
// a full import -> reload -> export cycle byte-for-byte, the state/persistence pipeline is intact.
test("import -> reload -> export round-trips the data unchanged", async ({ page }) => {
  // Import the known backup.
  await page.goto("/import");
  await page.setInputFiles('input[type="file"]', fixturePath);
  await page.getByRole("button", { name: "Import!" }).click();

  // Prove persistence: a full reload must rehydrate from localStorage.
  await page.goto("/");
  await page.reload();
  await expect(page.locator(".budgetlist-item")).toHaveCount(fixture.periods.length);

  // Export via the download menu and capture the produced file.
  await page.getByRole("button", { name: "Open menu" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download backup" }).click(),
  ]);
  const exported = JSON.parse(readFileSync(await download.path(), "utf8"));

  // Round-trip must be exact. (Fails today: export writes a bare array, import expects {periods}.)
  expect(exported).toEqual(fixture);
});

// Proves the parser is actually wired into the rendered UI — not just unit-tested in isolation.
test("rendered totals match the parsed ledger", async ({ page }) => {
  await page.goto("/import");
  await page.setInputFiles('input[type="file"]', fixturePath);
  await page.getByRole("button", { name: "Import!" }).click();
  await page.goto("/");

  // Trip: 500 hotel + 200 food = 700 spent; budgets 600 + 300 = 900.
  await expect(page.getByText("700 /").first()).toBeVisible();
  await expect(page.getByText("/ 900").first()).toBeVisible();
});
