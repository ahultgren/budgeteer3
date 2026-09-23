import { describe, it, expect } from "vitest";
import {
  currentCategories,
  totalSpent,
  totalBudget,
  formatAmount,
  findMatches,
  highlightSegments,
} from "../../assets/scripts.js";

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

describe("formatAmount — thousands grouping", () => {
  const NBSP = String.fromCharCode(160);
  it("leaves values under 1000 untouched", () => {
    expect(formatAmount(700)).toBe("700");
    expect(formatAmount(0)).toBe("0");
  });
  it("groups thousands with a no-break space", () => {
    expect(formatAmount(17788)).toBe(`17${NBSP}788`);
    expect(formatAmount(1000000)).toBe(`1${NBSP}000${NBSP}000`);
  });
  it("rounds and handles negatives", () => {
    expect(formatAmount(1234.6)).toBe(`1${NBSP}235`);
    expect(formatAmount(-1234)).toBe(`-1${NBSP}234`);
  });
});

describe("findMatches", () => {
  const hits = (text, query) =>
    findMatches(text, query).map((m) => m.ranges.map(([s, e]) => m.text.slice(s, e)));

  it("matches case-insensitively and reports line index, offset, and ranges", () => {
    expect(findMatches("Title\n199 home Lamp\n5 food", "lamp")).toEqual([
      { index: 1, offset: 6, text: "199 home Lamp", ranges: [[9, 13]] },
    ]);
  });

  it("returns [] for a blank query", () => {
    expect(findMatches("Title\n100 food", "  ")).toEqual([]);
  });

  it("requires every word on the same line, in any order", () => {
    const text = "Title\n100 ikea lamp\n50 ikea chair\n20 lamp shade";
    expect(findMatches(text, "lamp ikea").map((m) => m.index)).toEqual([1]);
    expect(hits(text, "lamp ikea")).toEqual([["ikea", "lamp"]]);
  });

  it("finds every occurrence and merges overlapping ranges", () => {
    expect(hits("x\ncoffee coffee", "coffee")).toEqual([["coffee", "coffee"]]);
    expect(hits("x\nfoodie", "foo odi")).toEqual([["foodi"]]);
  });

  it("includes the title line as index 0", () => {
    expect(findMatches("Trip\n500 hotel", "trip")).toEqual([
      { index: 0, offset: 0, text: "Trip", ranges: [[0, 4]] },
    ]);
  });

  it("ignores accents in both directions", () => {
    expect(hits("x\n40 café", "cafe")).toEqual([["café"]]);
    expect(hits("x\n40 cafe", "CAFÉ")).toEqual([["cafe"]]);
  });

  it("keeps å/ä/ö distinct from a/o", () => {
    expect(findMatches("x\n30 köp", "kop")).toEqual([]);
    expect(findMatches("x\n30 kop", "köp")).toEqual([]);
    expect(hits("x\n30 Åre", "åre")).toEqual([["Åre"]]);
  });

  it("maps ranges back to the original text when it is decomposed (NFD)", () => {
    const line = "40 café hårfin";
    expect(hits("x\n" + line, "café")).toEqual([["café"]]);
    expect(hits("x\n" + line, "hår")).toEqual([["hår"]]);
  });
});

describe("highlightSegments", () => {
  it("splits a line into hit and non-hit segments", () => {
    expect(highlightSegments("199 home lamp", [[9, 13]])).toEqual([
      { text: "199 home ", hit: false },
      { text: "lamp", hit: true },
    ]);
  });

  it("trims the start with an ellipsis when the first hit is far into the line", () => {
    const text = "2026-09-01 1299 electronics headphones from the store";
    const start = text.indexOf("store");
    const segments = highlightSegments(text, [[start, start + 5]]);
    expect(segments[0].text).toBe("…");
    expect(segments.map((s) => s.text).join("")).toBe("…" + text.slice(start - 10));
    expect(segments.at(-1)).toEqual({ text: "store", hit: true });
  });
});
