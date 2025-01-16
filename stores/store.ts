import { defineStore } from "pinia";

export type Period = {
  ledger: string;
  budget: Budget;
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
      });
    }

    function deleteLedger(index: number) {
      periods.value.splice(index, 1);
    }

    onMounted(() => {
      // Migrate from old localStorage solution
      // TODO remove this in the future
      const oldPeriods = window?.localStorage?.getItem?.("periods");

      if (oldPeriods) {
        window.localStorage.removeItem("periods");
        periods.value = JSON.parse(oldPeriods);
      }
    });

    return {
      periods,
      addLedger,
      deleteLedger,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  }
);
