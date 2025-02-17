<template>
  <div class="ledger">
    <textarea v-model="period.ledger" class="input box"></textarea>
  </div>
</template>

<script setup lang="ts">
import { type Period } from "~/stores/store";

defineProps<{
  period: Period;
}>();
</script>

<style lang="less" scoped>
.ledger {
  flex-grow: 1;
  width: 100%;
  position: relative;
  font-family: monospace;
  backface-visibility: hidden;
}
.input {
  width: 100%;
  font-size: inherit;
  font-family: inherit;
  word-spacing: inherit;

  border: 0;
  height: 100%;
  position: absolute;
  top: 0;
  background-color: transparent;
}
</style>
