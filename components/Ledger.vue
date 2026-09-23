<template>
  <div class="ledger overflow-hidden">
    <div
      v-if="highlighting"
      ref="mirror"
      aria-hidden="true"
      :class="textBox"
      class="pointer-events-none absolute inset-x-0 top-0 text-transparent [&::highlight(search)]:bg-accent/40"
      :style="{ translate: `0 ${-scrollTop}px` }"
    >{{ period.ledger + " " }}</div>
    <textarea
      ref="textarea"
      v-model="period.ledger"
      :class="textBox"
      class="absolute top-0 h-full w-full resize-none border-0 bg-transparent text-ink outline-none"
      @scroll="scrollTop = textarea!.scrollTop"
      @focus="focused = true"
      @blur="focused = false"
    ></textarea>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watchPostEffect } from "vue";
import { type Period } from "~/stores/store";
import { findMatches } from "~/assets/scripts";

const props = defineProps<{
  period: Period;
  query?: string;
}>();

// Shared by the textarea and the highlight mirror behind it; any difference misaligns the highlights.
// The trailing " " in the mirror reproduces the extra line a textarea shows after a final newline.
const textBox =
  "px-7 pb-40 font-mono text-base leading-relaxed whitespace-pre-wrap break-words [scrollbar-gutter:stable]";

const textarea = ref<HTMLTextAreaElement>();
const mirror = ref<HTMLElement>();
const focused = ref(false);
const scrollTop = ref(0);

const matches = computed(() => findMatches(props.period.ledger, props.query ?? ""));
const highlighting = computed(() => matches.value.length > 0 && !focused.value);

function ranges() {
  const text = mirror.value?.firstChild;
  if (!text) return [];
  return matches.value.flatMap((line) =>
    line.ranges.map(([start, end]) => {
      const range = new Range();
      range.setStart(text, line.offset + start);
      range.setEnd(text, line.offset + end);
      return range;
    })
  );
}

watchPostEffect((onCleanup) => {
  if (!highlighting.value || !("highlights" in CSS)) return;
  CSS.highlights.set("search", new Highlight(...ranges()));
  onCleanup(() => CSS.highlights.delete("search"));
});

onMounted(() => {
  const first = ranges()[0];
  if (!first || !textarea.value || !mirror.value) return;
  const y = first.getBoundingClientRect().top - mirror.value.getBoundingClientRect().top;
  textarea.value.scrollTop = y - textarea.value.clientHeight / 3;
});
</script>

<style scoped>
.ledger {
  flex-grow: 1;
  width: 100%;
  position: relative;
  backface-visibility: hidden;
}
</style>
