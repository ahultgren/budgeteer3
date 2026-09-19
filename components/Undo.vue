<template>
  <ToastRoot
    v-model:open="open"
    :duration="ttl"
    class="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-accent bg-card/95 py-3 pl-4 pr-3 shadow-2xl backdrop-blur"
  >
    <ToastTitle>Budget deleted.</ToastTitle>
    <ToastAction
      alt-text="Undo deletion"
      class="ml-auto rounded-lg px-3 py-1 font-semibold text-accent active:bg-white/10"
      @click="store.undo()"
    >
      Undo
    </ToastAction>
    <div
      :key="progressKey"
      class="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-accent"
      :style="{ animation: `progress ${ttl}ms linear` }"
    ></div>
  </ToastRoot>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { ToastRoot, ToastTitle, ToastAction } from "reka-ui";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();
const ttl = 5000;
const open = ref(false);
const progressKey = ref(0);

store.$onAction(({ name, after }) => {
  if (name !== "deleteLedger") {
    return;
  }
  after(() => {
    open.value = false;
    nextTick(() => {
      progressKey.value++;
      open.value = true;
    });
  });
});
</script>

<style>
@keyframes progress {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
