<template>
  <div class="overview box">
    <div
      v-for="item in currentCategories(period)"
      :key="item.name"
      class="overview-category"
    >
      <span class="overview-name">{{ item.name }}</span>
      <span class="overview-amount">{{ Math.round(item.amount) }}</span>
      <span class="overview-divider">/</span>
      <input v-model="period.budget[item.name]" class="overview-budget" />
    </div>
    <div class="overview-total">
      <span class="overview-name">Total:</span>
      <span class="overview-amount">{{ totalSpent(period) }}</span>
      <span class="overview-divider">/</span>
      <span class="overview-budget">{{ totalBudget(period) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentCategories, totalSpent, totalBudget } from "~/assets/scripts";

defineProps<{
  period: {
    budget: Record<string, number>;
  };
}>();
</script>

<style lang="less">
.overview {
  font-family: monospace;
  backface-visibility: hidden;
  flex-grow: 1;

  &-category,
  &-total {
    display: flex;
  }

  &-category {
    margin-bottom: 10px;
  }

  &-total {
    border-top: 1px solid #ccc;
    margin-top: 17px;
    padding-top: 11px;
  }

  &-amount {
    margin-left: auto;
  }

  &-divider {
    margin: 0 5px;
  }

  &-budget {
    width: 50px;
    padding: 0 0 1px 0;
    border: 0;
    border-bottom: 1px dashed #333;
  }
}

.chart {
  width: 100%;
  height: 0;
  padding-bottom: 62.5%;
  margin-top: 20px;
  position: relative;

  &-canvas {
    width: 100%;
    height: 100%;
    position: absolute;
  }
}
</style>
