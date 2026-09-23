import * as R from "ramda";

export function currentCategories(period) {
  const ledger = period.ledger;
  const entries = ledger.split(/\n/g).slice(1);
  const currencies = {
    sek: 1,
  };
  let currentCurrencyValue = 1;

  return R.pipe(
    R.reduce((obj, entry) => {
      const match = entry
        .toLowerCase()
        .match(/^([+-]?(?:[0-9]*[.])?[0-9]+)([a-z]{3})? +([^ ]+) *(.*)$/);

      if (match) {
        const [, amount, currencyCode, name] = match;
        const category = (obj[name] = obj[name] || {
          amount: 0,
          budget: Number(period.budget[name]) || 0,
          name,
        });
        const currencyValue = currencyCode
          ? currencies[currencyCode]
          : currentCurrencyValue;
        category.amount += Number(amount) / currencyValue;
        return obj;
      }

      const currency = entry
        .toLowerCase()
        .match(/^-([a-z]{3}) +([+-]?(?:[0-9]*[.])?[0-9]+)$/);
      if (currency) {
        const [, code, value] = currency;
        currentCurrencyValue = currencies[code] = Number(value);
        return obj;
      }

      return obj;
    }, {}),
    R.values,
    R.sortBy(R.prop("name"))
  )(entries);
}

export function totalSpent(period) {
  return Math.round(
    currentCategories(period)
      .map((x) => x.amount)
      .reduce((a, b) => a + b, 0)
  );
}

export function totalBudget(period) {
  return Math.round(
    currentCategories(period)
      .map((x) => x.budget)
      .reduce((a, b) => a + b, 0)
  );
}

// Thousands grouped with a no-break space, e.g. 17788 -> "17 788".
export function formatAmount(n) {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Folds case and accents one base character + its combining marks at a time, recording each
// folded char's source span so match ranges map back onto the original text. U+0308 and U+030A
// are kept: å/ä/ö are distinct letters in Swedish.
function fold(s) {
  let folded = "";
  const starts = [];
  const ends = [];
  for (const { 0: cluster, index } of s.matchAll(/\P{M}\p{M}*|\p{M}+/gu)) {
    const f = cluster
      .toLowerCase()
      .normalize("NFD")
      .replace(/(?![̈̊])\p{M}/gu, "")
      .normalize("NFC");
    for (let i = 0; i < f.length; i++) {
      starts.push(index);
      ends.push(index + cluster.length);
    }
    folded += f;
  }
  return { folded, starts, ends };
}

// Lines containing every whitespace-separated word of `query`. Ranges are line-relative.
export function findMatches(text, query) {
  const words = fold(query).folded.split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  let offset = 0;
  return text.split("\n").flatMap((line, index) => {
    const lineOffset = offset;
    offset += line.length + 1;

    const { folded, starts, ends } = fold(line);
    const ranges = [];
    for (const word of words) {
      let i = folded.indexOf(word);
      if (i === -1) return [];
      for (; i !== -1; i = folded.indexOf(word, i + 1)) {
        ranges.push([starts[i], ends[i + word.length - 1]]);
      }
    }
    return [{ index, offset: lineOffset, text: line, ranges: mergeRanges(ranges) }];
  });
}

function mergeRanges(ranges) {
  return ranges
    .sort((a, b) => a[0] - b[0])
    .reduce((merged, [start, end]) => {
      const last = merged.at(-1);
      if (last && start <= last[1]) last[1] = Math.max(last[1], end);
      else merged.push([start, end]);
      return merged;
    }, []);
}

export function highlightSegments(text, ranges) {
  // ponytail: trims by character count, not rendered width — measure if long lines still hide the hit.
  const first = ranges[0]?.[0] ?? 0;
  const cut = first > 20 ? first - 10 : 0;

  const segments = cut ? [{ text: "…", hit: false }] : [];
  let pos = cut;
  for (const [start, end] of ranges) {
    if (start > pos) segments.push({ text: text.slice(pos, start), hit: false });
    segments.push({ text: text.slice(start, end), hit: true });
    pos = end;
  }
  if (pos < text.length) segments.push({ text: text.slice(pos), hit: false });
  return segments;
}
