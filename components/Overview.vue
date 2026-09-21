<template>
  <div class="overview flex-grow px-7 py-2 text-lg">
    <div
      v-for="item in currentCategories(period)"
      :key="item.name"
      class="flex items-center py-2"
    >
      <span>{{ item.name }}</span>
      <span class="ml-auto tabular-nums">{{ formatAmount(item.amount) }}</span>
      <span class="mx-2 text-muted">/</span>
      <input
        v-model="period.budget[item.name]"
        class="w-16 border-0 border-b border-dashed border-accent bg-transparent text-right tabular-nums text-accent outline-none"
      />
    </div>
    <div class="mt-3 flex items-center border-t border-white/15 pt-3 font-semibold">
      <span>Total:</span>
      <span class="ml-auto tabular-nums">{{ formatAmount(totalSpent(period)) }}</span>
      <span class="mx-2 text-muted">/</span>
      <span class="w-16 pr-px text-right tabular-nums">{{ formatAmount(totalBudget(period)) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { currentCategories, totalSpent, totalBudget, formatAmount } from "~/assets/scripts";

defineProps<{
  period: {
    budget: Record<string, number>;
  };
}>();
</script>

<style scoped>
.overview {
  backface-visibility: hidden;
}
</style>
