<template>
  <div v-if="currentPeriod" class="container">
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <router-link
        to="/"
        aria-label="Budgets"
        class="flex size-11 items-center justify-center rounded-full bg-white/10 text-accent active:bg-white/20"
      >
        <ChevronLeft :size="28" />
      </router-link>
      <button
        :aria-label="currentView === 'Ledger' ? 'Summary' : 'Ledger'"
        class="flex size-11 items-center justify-center rounded-full bg-white/10 text-accent active:bg-white/20"
        @click="toggleView()"
      >
        <ChartBarDecreasing v-if="currentView === 'Ledger'" :size="22" />
        <AlignLeft v-else :size="22" />
      </button>
    </div>

    <div class="main">
      <Flip>
        <template #front>
          <Ledger v-if="currentView === 'Ledger'" :period="currentPeriod"></Ledger>
        </template>
        <template #back>
          <Overview v-if="currentView === 'Overview'" :period="currentPeriod"></Overview>
        </template>
      </Flip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { ChevronLeft, ChartBarDecreasing, AlignLeft } from "@lucide/vue";
import { usePeriodStore } from "~/stores/store";
import Flip from "~/components/Flip.vue";
import Ledger from "~/components/Ledger.vue";
import Overview from "~/components/Overview.vue";

const route = useRoute();
const store = usePeriodStore();

const currentView = ref("Ledger");
const currentPeriod = store.getLedgerById(route.params.currentPeriod as string);

const toggleView = () => {
  currentView.value = currentView.value === "Ledger" ? "Overview" : "Ledger";
};
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}
</style>
