<template>
  <div v-if="currentPeriod" class="container">
    <TopBar>
      <template #left>
        <TopBarButton :icon="ChevronLeft" :size="28" to="/" aria-label="Budgets" />
      </template>
      <template #right>
        <TopBarButton
          :icon="currentView === 'Ledger' ? ChartBarDecreasing : AlignLeft"
          :size="22"
          :aria-label="currentView === 'Ledger' ? 'Summary' : 'Ledger'"
          @click="toggleView()"
        />
      </template>
    </TopBar>

    <div class="main">
      <Flip>
        <template #front>
          <Ledger
            v-if="currentView === 'Ledger'"
            :period="currentPeriod"
            :query="route.query.q as string | undefined"
          ></Ledger>
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
import TopBar from "~/components/TopBar.vue";
import TopBarButton from "~/components/TopBarButton.vue";
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
