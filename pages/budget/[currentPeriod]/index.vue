<template>
  <div v-if="currentPeriod" class="container">
    <div class="nav box">
      <router-link class="btn" to="/"
        ><Button size="small" icon="pi pi-chevron-left" label="Budgets"
      /></router-link>
      <Button
        class="nav-view"
        size="small"
        icon="pi pi-sync"
        @click="toggleView()"
        :label="currentView === 'Ledger' ? 'Summary' : 'Ledger'"
      />
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
