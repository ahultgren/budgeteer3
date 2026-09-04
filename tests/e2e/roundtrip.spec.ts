import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fixturePath = fileURLToPath(new URL("./fixtures/backup.json", import.meta.url));
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

test("import -> reload -> export round-trips the data unchanged", async ({ page }) => {
  await page.goto("/import");
  await page.setInputFiles('input[type="file"]', fixturePath);
  await page.getByRole("button", { name: "Import!" }).click();

  // Reload forces rehydration from localStorage.
  await page.goto("/");
  await page.reload();
  await expect(page.locator(".budgetlist-item")).toHaveCount(fixture.periods.length);

  await page.getByRole("button", { name: "Open menu" }).click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download backup" }).click(),
  ]);
  const exported = JSON.parse(readFileSync(await download.path(), "utf8"));

  expect(exported).toEqual(fixture);
});

test("rendered totals match the parsed ledger", async ({ page }) => {
  await page.goto("/import");
  await page.setInputFiles('input[type="file"]', fixturePath);
  await page.getByRole("button", { name: "Import!" }).click();
  await page.goto("/");

  // Trip period: 500 hotel + 200 food spent, 600 + 300 budgeted.
  await expect(page.getByText("700 /").first()).toBeVisible();
  await expect(page.getByText("/ 900").first()).toBeVisible();
});
