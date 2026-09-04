import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";

const backup = JSON.parse(
  readFileSync(fileURLToPath(new URL("./fixtures/backup.json", import.meta.url)), "utf8")
);

export const fixture = backup as { periods: Array<{ id: string; ledger: string; budget: Record<string, number> }> };

// pinia-plugin-persistedstate stores the (non-omitted) state under the store's id ("store")
// as `{ periods: [...] }`. Injecting it before load makes ids deterministic, so screenshots
// and /budget/:id routes are stable across runs and across the migration.
export async function seedStore(page: Page) {
  await page.addInitScript((data) => {
    localStorage.setItem("store", JSON.stringify(data));
  }, { periods: fixture.periods });
}
