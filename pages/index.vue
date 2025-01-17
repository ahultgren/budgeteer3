<template>
  <div class="container">
    <div class="nav box">
      <button class="nav-add btn" @click="store.addLedger()">+</button>
      <a class="btn nav-view" :href="downloadData()" target="_blank">Backup</a>
    </div>
    <div class="budgetlist">
      <SwipeList :items="reversePeriods">
        <template #default="{ item: [period, index] }">
          <nuxt-link :to="'/budget/' + index" class="budgetlist-item" :value="index">
            <span class="budgetlist-item-title">{{ title(period.ledger) }}</span>
            <span class="budgetlist-item-summary">
              {{ totalSpent(period) }} /
              {{ totalBudget(period) }}
            </span>
          </nuxt-link>
        </template>
        <template #right="{ item: [_, index] }">
          <button
            class="action-button swipeout-action"
            @click="store.deleteLedger(index)"
          >
            Delete
          </button>
        </template>
      </SwipeList>
    </div>
    <nuxt-link to="/import">Import data from old domain</nuxt-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { totalSpent, totalBudget } from "~/assets/scripts";
import { SwipeList } from "@ahultgren/vue3-swipe-actions";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();

const reversePeriods = computed(() => {
  return store.periods
    .map((item, i) => {
      return [item, i];
    })
    .reverse();
});

const title = (ledger: string) => {
  return ledger.split("\n")[0];
};

const downloadData = () => {
  return `data:application/octet-stream,${encodeURIComponent(
    JSON.stringify(store.periods)
  )}`;
};
</script>

<style lang="less">
@import "@ahultgren/vue3-swipe-actions/style.css";

.budgetlist {
  &-item {
    text-decoration: none;
    color: inherit;
    margin: 0 10px;
    border-bottom: 1px solid #eee;
    display: block;
    padding: 12px 0;

    &-title {
      display: block;
      margin-bottom: 3px;
    }

    &-summary {
      display: block;
      font-size: 14px;
      color: #666;
    }
  }
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0 3rem;
  cursor: pointer;
  left: 0;

  appearance: none;
  border: none;
  background-color: rgb(255, 59, 48);
  color: white;
  padding: 0 15px;
}

.transition-right {
  transform: translate3d(100%, 0, 0) !important;
}

.transition-left {
  transform: translate3d(-100%, 0, 0) !important;
}
</style>
