<template>
  <div class="ledger">
    <textarea
      v-model="period.ledger"
      class="absolute top-0 h-full w-full resize-none border-0 bg-transparent px-7 pb-40 font-mono text-base leading-relaxed text-ink outline-none"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { type Period } from "~/stores/store";

defineProps<{
  period: Period;
}>();
</script>

<style scoped>
.ledger {
  flex-grow: 1;
  width: 100%;
  position: relative;
  backface-visibility: hidden;
}
</style>
