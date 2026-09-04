import { describe, it, expect } from "vitest";
import { currentCategories, totalSpent, totalBudget } from "../../assets/scripts.js";

// The parser skips the first ledger line as the title, so prepend one.
const period = (ledgerBody, budget = {}) => ({
  ledger: "Title\n" + ledgerBody,
  budget,
});

describe("currentCategories — basic parsing", () => {
  it("adds a single transaction in the default currency", () => {
    expect(currentCategories(period("100 food"))).toEqual([
      { name: "food", amount: 100, budget: 0 },
    ]);
  });

  it("skips the first line (title)", () => {
    expect(currentCategories({ ledger: "100 title\n50 food", budget: {} })).toEqual([
      { name: "food", amount: 50, budget: 0 },
    ]);
  });

  it("accumulates duplicate categories", () => {
    expect(currentCategories(period("100 food\n50 food"))[0].amount).toBe(150);
  });

  it("handles decimals, explicit +, and negative amounts", () => {
    expect(currentCategories(period("50.5 food\n+25 food\n-10 food"))[0].amount).toBeCloseTo(
      65.5,
      10
    );
  });

  it("sorts categories alphabetically by name", () => {
    const names = currentCategories(period("1 zebra\n1 apple\n1 mango")).map((c) => c.name);
    expect(names).toEqual(["apple", "mango", "zebra"]);
  });

  it("captures only the first word as the category name (multi-word not supported)", () => {
    expect(currentCategories(period("100 my food"))).toEqual([
      { name: "my", amount: 100, budget: 0 },
    ]);
  });
});

describe("currentCategories — currencies", () => {
  it("converts an inline currency using its defined rate", () => {
    const cats = currentCategories(period("-eur 0.086\n100eur food"));
    expect(cats[0].amount).toBeCloseTo(100 / 0.086, 6);
  });

  it("treats sek as the base currency (rate 1) even inline", () => {
    expect(currentCategories(period("100sek food"))[0].amount).toBe(100);
  });

  it("a currency-definition line changes the default for all following bare-number lines", () => {
    const cats = currentCategories(period("-eur 0.086\n100 food"));
    expect(cats[0].amount).toBeCloseTo(100 / 0.086, 6);
  });

  it("using an inline currency does NOT change the running default", () => {
    const cats = currentCategories(period("-eur 0.086\n100sek food\n100 food"));
    expect(cats[0].amount).toBeCloseTo(100 + 100 / 0.086, 6);
  });

  it("produces NaN for an undefined currency (documented current behavior — the bug)", () => {
    const cats = currentCategories(period("100usd food"));
    expect(Number.isNaN(cats[0].amount)).toBe(true);
  });
});

describe("currentCategories — robustness", () => {
  it("silently skips lines that match no pattern", () => {
    const cats = currentCategories(period("hello world\n100 food\n\n   "));
    expect(cats).toEqual([{ name: "food", amount: 100, budget: 0 }]);
  });

  it("returns [] for an empty ledger", () => {
    expect(currentCategories({ ledger: "", budget: {} })).toEqual([]);
  });

  it("returns [] for a title-only ledger", () => {
    expect(currentCategories({ ledger: "Just a title", budget: {} })).toEqual([]);
  });
});

describe("currentCategories — budget mapping", () => {
  it("pulls each category's budget from period.budget", () => {
    const cats = currentCategories(period("100 food", { food: 20, unused: 5 }));
    expect(cats).toEqual([{ name: "food", amount: 100, budget: 20 }]);
  });

  it("coerces a non-numeric budget to 0 (guarded by `|| 0`)", () => {
    const cats = currentCategories(period("100 food", { food: "abc" }));
    expect(cats[0].budget).toBe(0);
  });

  it("coerces a numeric-string budget (as bound by the <input>) to a number", () => {
    const cats = currentCategories(period("100 food", { food: "20" }));
    expect(cats[0].budget).toBe(20);
  });
});

describe("totalSpent / totalBudget", () => {
  it("rounds the summed spend", () => {
    expect(totalSpent(period("-eur 0.086\n100eur food", { food: 1000 }))).toBe(1163);
  });

  it("rounds the summed budget", () => {
    expect(totalBudget(period("-eur 0.086\n100eur food", { food: 1000 }))).toBe(1000);
  });

  it("only counts budgets for categories present in the ledger", () => {
    expect(totalBudget(period("100 food", { food: 20, unused: 999 }))).toBe(20);
  });

  it("returns 0 for an empty ledger", () => {
    expect(totalSpent({ ledger: "", budget: {} })).toBe(0);
    expect(totalBudget({ ledger: "", budget: {} })).toBe(0);
  });

  it("propagates NaN from an undefined currency", () => {
    expect(Number.isNaN(totalSpent(period("100usd food")))).toBe(true);
  });
});
