<template>
  <div class="ledger">
    <textarea v-model="period.ledger" class="input box"></textarea>
  </div>
</template>

<script setup>
const props = defineProps({
  period: Object,
});
</script>

<style lang="less" scoped>
.ledger {
  font-family: monospace;
  width: 100%;
  position: relative;
  padding-bottom: 300px;
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
  caret-color: #000;
}
</style>
