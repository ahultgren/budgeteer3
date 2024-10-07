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
