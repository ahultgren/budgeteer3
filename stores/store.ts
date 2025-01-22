import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";

export type Period = {
  ledger: string;
  budget: Budget;
  id: string;
};

export type Budget = Record<string, number>;

function getDefault(): Period[] {
  return [
    {
      ledger: `Demo ledger

Start a line with a number to add a transaction.

100 food
199 home lamp

# Hashtags are section titles. For example for dates.
Might be used for cool stuff in the future.

Start a line with a dash and three letters to 
define and change currency:

-eur 0.086

-1 food reimbursement

Or use any defined currency on the fly like this:
100sek food
`,
      budget: { test: 20 },
      id: uuidv4(),
    },
  ];
}

export const usePeriodStore = defineStore(
  "store",
  () => {
    const periods = ref<Period[]>(getDefault());

    function addLedger() {
      periods.value.push({
        ledger: "New Ledger\n",
        budget: {},
        id: uuidv4(),
      });
    }

    function deleteLedger(index: number) {
      periods.value.splice(index, 1);
    }

    return {
      periods,
      addLedger,
      deleteLedger,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
      afterHydrate: (context) => {
        const unmigrated = context.store.periods.filter(
          (period: Period) => !period.id
        );

        if (unmigrated.length > 0) {
          console.log("Unmigrated periods", unmigrated);
          context.store.periods = context.store.periods.map(
            (period: Period) => ({
              ...period,
              id: period.id || uuidv4(),
            })
          );
          console.log("Migrated periods", context.store.periods);
        }
      },
    },
  }
);
