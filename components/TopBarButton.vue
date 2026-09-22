<template>
  <component
    :is="to ? RouterLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    class="flex size-11 items-center justify-center rounded-full border border-transparent text-accent shadow-[inset_0_0_3px_rgba(0,0,0,0.3)] [background:linear-gradient(#2c2c2e,#2c2c2e)_padding-box,linear-gradient(135deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.6))_border-box] active:[background:linear-gradient(#3a3a3c,#3a3a3c)_padding-box,linear-gradient(135deg,rgba(255,255,255,0.6),rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.6))_border-box]"
  >
    <component :is="icon" :size="size" />
  </component>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import type { Component } from "vue";

// Gradient border via padding-box/border-box layering — border-image ignores
// border-radius and would square off a round button.
withDefaults(defineProps<{ icon: Component; to?: string; size?: number }>(), {
  size: 24,
});
</script>
