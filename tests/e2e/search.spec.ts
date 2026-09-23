import { test, expect, type Page } from "@playwright/test";
import { seedStore } from "./seed";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const sw = (navigator as any).serviceWorker;
    if (sw) sw.register = () => Promise.reject(new Error("SW disabled in search tests"));
  });
});

const searchbox = (page: Page) => page.getByRole("searchbox", { name: "Search" });
const searchField = (page: Page) => searchbox(page).locator("xpath=../..");
const scrollY = (page: Page) => page.evaluate(() => window.scrollY);
const highlightCount = (page: Page) =>
  page.evaluate(() => CSS.highlights.get("search")?.size ?? 0);

test.describe("with the fixture", () => {
  test.beforeEach(({ page }) => seedStore(page));

  test("search field starts hidden under the top bar and fades in when pulled down", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".budgetlist-item").first()).toBeVisible();
    const height = await searchField(page).evaluate((el) => (el as HTMLElement).offsetHeight);

    await expect.poll(() => scrollY(page)).toBe(height);
    await expect(searchField(page)).toHaveCSS("opacity", "0");

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(searchField(page)).toHaveCSS("opacity", "1");
  });

  test("filters periods and highlights the matching line", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 0));
    const rows = page.locator(".budgetlist-item");

    await searchbox(page).fill("food");
    await expect(page).toHaveURL(/\/\?q=food$/);
    await expect(rows).toHaveCount(2);
    await expect(rows.locator("mark")).toHaveText(["food", "food"]);

    await searchbox(page).fill("o");
    await expect(rows.filter({ hasText: "Trip" })).toContainText("hotel+1 more");
    await expect(rows.filter({ hasText: "Groceries" })).toContainText("100 food+2 more");

    await searchbox(page).fill("trip");
    await expect(rows).toHaveCount(1);
    await expect(rows.locator("mark")).toHaveText("Trip");
    await expect(rows).toContainText("700 / 900");

    await searchbox(page).fill("zzz");
    await expect(rows).toHaveCount(0);
    await expect(page.getByText("No results")).toBeVisible();

    await searchbox(page).fill("");
    await expect(page).toHaveURL(/\/$/);
    await expect(rows).toHaveCount(2);
  });

  test("opening a result highlights matches until the ledger is focused", async ({ page }) => {
    await page.goto("/?q=coffee");
    await expect(searchbox(page)).toHaveValue("coffee");
    await expect.poll(() => scrollY(page)).toBe(0);

    await page.getByRole("link", { name: /Groceries/ }).click();
    await expect(page).toHaveURL(/\/budget\/test-period-1\?q=coffee$/);
    await expect.poll(() => highlightCount(page)).toBe(1);

    const textarea = page.locator("textarea");
    await textarea.focus();
    await expect.poll(() => highlightCount(page)).toBe(0);
    await textarea.press("End");
    await textarea.pressSequentially("\n5 coffee");
    await textarea.blur();
    await expect.poll(() => highlightCount(page)).toBe(2);

    await page.goBack();
    await expect(page).toHaveURL(/\/\?q=coffee$/);
    await expect(searchbox(page)).toHaveValue("coffee");
    await expect(searchField(page)).toHaveCSS("opacity", "1");
  });

  test("search results", async ({ page }) => {
    await page.goto("/?q=o");
    await expect(page.locator(".budgetlist-item mark").first()).toBeVisible();
    await expect(page).toHaveScreenshot("search.png", { maxDiffPixelRatio: 0.01 });
  });
});

test("highlight mirror wraps and scrolls glyph-for-glyph with the textarea", async ({ page }) => {
  const line =
    "1299 electronics noise-cancelling headphones bought at the airport lamp shop because the old ones broke";
  const ledger = [
    "Long lines",
    ...Array.from({ length: 40 }, (_, i) => `${i} ${line}`),
    "5 averyveryveryveryveryveryveryveryveryveryverylongunbrokenwordlamp",
    "",
  ].join("\n");
  await page.addInitScript((data) => localStorage.setItem("store", JSON.stringify(data)), {
    periods: [{ id: "long", ledger, budget: {} }],
  });

  await page.goto("/budget/long?q=lamp");
  await expect.poll(() => highlightCount(page)).toBe(41);
  await expect(page.locator('[class*="-enter-active"]')).toHaveCount(0);
  const textarea = page.locator("textarea");
  const mirror = page.locator(".ledger > div");

  // Paint the same text from either layer and compare pixels. The two layers anti-alias a few
  // levels apart; a glyph shifted by even 1px differs by hundreds.
  async function shot(visible: "mirror" | "textarea") {
    await mirror.evaluate((el, v) => (el.style.color = v === "mirror" ? "white" : ""), visible);
    await textarea.evaluate((el, v) => (el.style.color = v === "mirror" ? "transparent" : ""), visible);
    return (await page.screenshot()).toString("base64");
  }
  const maxPixelDiff = async () =>
    page.evaluate(async ([a, b]) => {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = "data:image/png;base64," + src;
        });
      const [ia, ib] = await Promise.all([load(a), load(b)]);
      const ctx = Object.assign(document.createElement("canvas"), { width: ia.width, height: ia.height })
        .getContext("2d")!;
      ctx.drawImage(ia, 0, 0);
      const da = ctx.getImageData(0, 0, ia.width, ia.height).data;
      ctx.drawImage(ib, 0, 0);
      const db = ctx.getImageData(0, 0, ia.width, ia.height).data;
      let max = 0;
      for (let i = 0; i < da.length; i++) max = Math.max(max, Math.abs(da[i] - db[i]));
      return max;
    }, [await shot("mirror"), await shot("textarea")]);

  expect(await maxPixelDiff()).toBeLessThanOrEqual(8);

  // 1232 × Pixel 5's DPR 2.75 is a whole device pixel. At a fractional one the two layers round
  // half a device pixel apart, which is invisible but fails a pixel comparison.
  await textarea.evaluate((el) => (el.scrollTop = 1232));
  await expect.poll(() => mirror.evaluate((el) => el.style.translate)).toBe("0px -1232px");
  expect(await maxPixelDiff()).toBeLessThanOrEqual(8);
});
