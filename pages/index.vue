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

    <TopBar>
      <template #left>
        <TopBarButton :icon="Menu" aria-label="Open menu" @click="showMenu = true" />
      </template>
      <template #right>
        <TopBarButton :icon="SquarePen" aria-label="Create new ledger" @click="store.addLedger()" />
      </template>
    </TopBar>

    <!-- view() inset 68px = TopBar height, so the field fades out as it passes under the bar. -->
    <div
      ref="searchField"
      class="px-4 pt-2 supports-[animation-timeline:view()]:animate-search-fade supports-[animation-timeline:view()]:[animation-timeline:view(68px_0px)] supports-[animation-timeline:view()]:[animation-range:exit]"
    >
      <label class="flex h-9 items-center gap-1.5 rounded-xl bg-card px-2 text-muted">
        <Search :size="18" class="shrink-0" />
        <input
          v-model="query"
          type="search"
          placeholder="Search"
          aria-label="Search"
          enterkeyhint="search"
          autocomplete="off"
          class="min-w-0 flex-1 bg-transparent text-[17px] text-ink outline-none placeholder:text-muted"
        />
      </label>
    </div>

    <div class="min-h-screen px-4 pt-4 pb-8">
      <TransitionGroup
        tag="div"
        name="periods"
        :css="!searching"
        class="budgetlist overflow-hidden rounded-2xl bg-card"
      >
        <SwipeOut v-for="{ period, titleMatch, lineMatches } in results" :key="period.id">
          <template #default>
            <router-link :to="{ path: '/budget/' + period.id, query: route.query }" class="budgetlist-item">
              <span class="budgetlist-item-title">
                <Highlighted v-if="titleMatch" :text="titleMatch.text" :ranges="titleMatch.ranges" />
                <template v-else>{{ title(period.ledger) }}</template>
              </span>
              <span class="budgetlist-item-summary">
                <span v-if="lineMatches.length" class="flex gap-1">
                  <span class="truncate">
                    <Highlighted :text="lineMatches[0].text" :ranges="lineMatches[0].ranges" />
                  </span>
                  <span v-if="lineMatches.length > 1" class="shrink-0">+{{ lineMatches.length - 1 }} more</span>
                </span>
                <template v-else>
                  {{ formatAmount(totalSpent(period)) }} / {{ formatAmount(totalBudget(period)) }}
                </template>
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
      <p v-if="searching && !results.length" class="py-8 text-center text-muted">No results</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  totalSpent,
  totalBudget,
  formatAmount,
  findMatches,
  highlightSegments,
} from "~/assets/scripts";
import { SwipeOut } from "@ahultgren/vue3-swipe-actions";
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
} from "reka-ui";
import { Menu, SquarePen, Download, Upload, Trash2, Search } from "@lucide/vue";
import { usePeriodStore } from "~/stores/store";
import TopBar from "~/components/TopBar.vue";
import TopBarButton from "~/components/TopBarButton.vue";

const store = usePeriodStore();
const route = useRoute();
const router = useRouter();

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

const query = computed({
  get: () => (route.query.q as string) ?? "",
  set: (q: string) => router.replace({ query: q ? { q } : {} }),
});
const searching = computed(() => query.value.trim() !== "");

const results = computed(() =>
  reversePeriods.value.flatMap((period) => {
    if (!searching.value) return [{ period, titleMatch: undefined, lineMatches: [] }];
    const matches = findMatches(period.ledger, query.value);
    if (!matches.length) return [];
    return [
      {
        period,
        titleMatch: matches[0].index === 0 ? matches[0] : undefined,
        lineMatches: matches.filter((m) => m.index > 0),
      },
    ];
  })
);

const Highlighted = ({ text, ranges }: { text: string; ranges: [number, number][] }) =>
  highlightSegments(text, ranges).map((s) =>
    s.hit ? h("mark", { class: "rounded-sm bg-accent/30 text-ink" }, s.text) : s.text
  );

// Settling the search field on release:
// - Released while fully hidden (scrolling the list): momentum stops at the list top, never reveals it.
// - Released partly covered: project where momentum would land. Past either end, momentum finishes on
//   its own; partly covered, snap open if at most 10% covered, otherwise hide.
// Not CSS scroll-snap: iOS WebKit disables momentum scrolling on snapping scrollers
// (https://bugs.webkit.org/show_bug.cgi?id=243582). Not `behavior: "smooth"`: too slow.
const searchField = ref<HTMLElement>();
let touching = false;
let touchSamples: { y: number; t: number }[] = [];
let momentumFloor = 0;
let settleTimer: ReturnType<typeof setTimeout> | undefined;
let settleFrame = 0;

// Momentum distance per px/ms of release velocity, from UIScrollView's 0.998/ms deceleration rate
// (WWDC18 "Designing Fluid Interfaces").
const MOMENTUM = 0.998 / (1 - 0.998);

function settleSearchField(velocity = 0) {
  const from = window.scrollY;
  const height = searchField.value!.offsetHeight;
  const landing = from + velocity * MOMENTUM;
  if (touching || from <= 0 || from >= height || landing <= 0 || landing >= height) return;
  const to = landing <= height * 0.1 ? 0 : height;
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min((now - start) / 150, 1);
    window.scrollTo(0, from + (to - from) * (1 - (1 - t) ** 3));
    if (t < 1) settleFrame = requestAnimationFrame(step);
  };
  settleFrame = requestAnimationFrame(step);
}

function scheduleSettle(delay: number) {
  clearTimeout(settleTimer);
  settleTimer = setTimeout(settleSearchField, delay);
}

const listeners = {
  scroll: () => {
    if (!touching && momentumFloor > 0 && window.scrollY < momentumFloor) {
      window.scrollTo(0, momentumFloor);
      return;
    }
    scheduleSettle(100);
  },
  touchstart: () => {
    touching = true;
    touchSamples = [];
    momentumFloor = 0;
    clearTimeout(settleTimer);
    cancelAnimationFrame(settleFrame);
  },
  touchmove: (e: TouchEvent) => {
    touchSamples = touchSamples.filter((s) => s.t >= e.timeStamp - 100);
    touchSamples.push({ y: e.touches[0].clientY, t: e.timeStamp });
  },
  touchend: (e: TouchEvent) => {
    touching = false;
    const recent = touchSamples.filter((s) => s.t >= e.timeStamp - 100);
    const first = recent[0];
    const last = recent.at(-1);
    const fingerVelocity = first && last && last.t > first.t ? (last.y - first.y) / (last.t - first.t) : 0;
    const height = searchField.value!.offsetHeight;
    momentumFloor = window.scrollY >= height ? height : 0;
    clearTimeout(settleTimer);
    settleSearchField(-fingerVelocity);
  },
};

onMounted(() => {
  window.scrollTo(0, searching.value ? 0 : searchField.value!.offsetHeight);
  for (const [event, listener] of Object.entries(listeners)) {
    window.addEventListener(event, listener as EventListener, { passive: true });
  }
});
onUnmounted(() => {
  clearTimeout(settleTimer);
  cancelAnimationFrame(settleFrame);
  for (const [event, listener] of Object.entries(listeners)) {
    window.removeEventListener(event, listener as EventListener);
  }
});
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
