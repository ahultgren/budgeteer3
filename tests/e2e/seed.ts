import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

const backup = JSON.parse(
  readFileSync(fileURLToPath(new URL("./fixtures/backup.json", import.meta.url)), "utf8")
);

export const fixture = backup as { periods: Array<{ id: string; ledger: string; budget: Record<string, number> }> };

// persistedstate keys localStorage by the store id ("store") with shape `{ periods: [...] }`.
// Seeding it before load fixes the period ids, keeping /budget/:id routes and screenshots stable.
export async function seedStore(page: Page) {
  await page.addInitScript((data) => {
    localStorage.setItem("store", JSON.stringify(data));
  }, { periods: fixture.periods });
}
