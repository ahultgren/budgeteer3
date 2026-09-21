<template>
  <div class="container">
    <DialogRoot v-model:open="showMenu">
      <DialogPortal>
        <DialogOverlay
          class="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-[fade-in_0.2s_ease-out]"
        />
        <DialogContent
          class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card p-6 shadow-2xl focus:outline-none data-[state=open]:animate-[drawer-in_0.25s_ease-out] data-[state=closed]:animate-[drawer-out_0.2s_ease-in]"
        >
          <DialogTitle class="mb-6 text-2xl font-bold">Budgeteer</DialogTitle>
          <a
            :href="backupUrl"
            download="budgeteer-backup.json"
            target="_blank"
            class="flex items-center gap-3 rounded-xl px-2 py-3 text-accent hover:bg-white/5"
          >
            <Download :size="20" />Download backup
          </a>
          <router-link
            to="/import"
            class="flex items-center gap-3 rounded-xl px-2 py-3 text-accent hover:bg-white/5"
            @click="showMenu = false"
          >
            <Upload :size="20" />Import backup
          </router-link>
          <div class="mt-auto text-xs text-muted">{{ version }}</div>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>

    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <button
        aria-label="Open menu"
        class="flex size-11 items-center justify-center rounded-full bg-white/10 text-accent active:bg-white/20"
        @click="showMenu = true"
      >
        <Menu :size="24" />
      </button>
      <button
        aria-label="Create new ledger"
        class="flex size-11 items-center justify-center rounded-full bg-white/10 text-accent active:bg-white/20"
        @click="store.addLedger()"
      >
        <SquarePen :size="24" />
      </button>
    </div>

    <div class="px-4 pt-4 pb-8">
      <TransitionGroup tag="div" name="periods" class="budgetlist overflow-hidden rounded-2xl bg-card">
        <SwipeOut v-for="period in reversePeriods" :key="period.id">
          <template #default>
            <router-link :to="'/budget/' + period.id" class="budgetlist-item">
              <span class="budgetlist-item-title">{{ title(period.ledger) }}</span>
              <span class="budgetlist-item-summary">
                {{ formatAmount(totalSpent(period)) }} / {{ formatAmount(totalBudget(period)) }}
              </span>
            </router-link>
          </template>
          <template #right>
            <button
              class="action-button swipeout-action"
              @click="store.deleteLedger(period)"
            >
              <Trash2 :size="20" class="action-button-icon" />Delete
            </button>
          </template>
        </SwipeOut>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { totalSpent, totalBudget, formatAmount } from "~/assets/scripts";
import { SwipeOut } from "@ahultgren/vue3-swipe-actions";
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "reka-ui";
import { Menu, SquarePen, Download, Upload, Trash2 } from "@lucide/vue";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();

const version = __APP_VERSION__;
const reversePeriods = computed(() => store.periods.slice().reverse());
const showMenu = ref(false);

const backupUrl = computed(() =>
  URL.createObjectURL(
    new Blob([JSON.stringify({ periods: store.periods })], {
      type: "application/json",
    })
  )
);

const title = (ledger: string) => ledger.split("\n")[0];
</script>

<style lang="less">
@import "@ahultgren/vue3-swipe-actions/style.css";

@keyframes drawer-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
@keyframes drawer-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Hairline divider between rows, inset to align with the title text (measured from
   iOS Notes: 28px content inset, #38383B separator). No divider above the first row. */
.budgetlist .swipeout + .swipeout::before {
  content: "";
  position: absolute;
  top: 0;
  left: 28px;
  right: 16px;
  height: 1px;
  background-color: var(--color-separator);
  z-index: 1;
}

.budgetlist-item {
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 10px 16px 10px 28px;

  &-title {
    display: block;
    font-size: 17px;
    line-height: 1.25;
    font-weight: 600;
    margin-bottom: 1px;
  }

  &-summary {
    display: block;
    font-size: 15px;
    line-height: 1.25;
    color: var(--color-muted);
  }
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  left: 0;
  appearance: none;
  border: none;
  background-color: rgb(255, 59, 48);
  color: white;
  padding: 0 22px;
}

.transition-right {
  transform: translate3d(100%, 0, 0) !important;
}

.transition-left {
  transform: translate3d(-100%, 0, 0) !important;
}

.periods-enter-active {
  transition: all 0.5s ease;
}
.periods-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.periods-move,
.periods-leave-active {
  transition-property: transform, max-height;
  transition-duration: 0.5s;
  transition-timing-function: cubic-bezier(0.39, 0.01, 0.1, 0.98);
}
.periods-leave-active .swipeout-right {
  transition-property: left, transform;
  transition-duration: 0.2s;
  transition-timing-function: cubic-bezier(0, 0, 0.1, 0.98);
}
.periods-leave-active {
  position: absolute;
  width: 100%;
  max-height: 70px;

  .action-button {
    position: absolute;
    height: 100%;
    max-width: 100px;
  }
}
.periods-leave-to {
  transform: scaleY(0);
  transform-origin: top;
  max-height: 0;

  .swipeout-right {
    left: 0;
    transform: translate(0);
  }

  .action-button {
    position: absolute;
    transform: none !important;
    width: 100%;
    height: 100%;
    max-width: 100%;
  }
}
</style>
