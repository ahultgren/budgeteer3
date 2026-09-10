<template>
  <div class="container">
    <Drawer v-model:visible="showMenu" header="Budgeteer">
      <Menu :model="menuItems">
        <template #item="{ item, props }">
          <router-link class="p-menu-item-link" v-if="item.route" :to="item.route">
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </router-link>
          <a
            v-else
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
            :download="item.download"
          >
            <span :class="item.icon" />
            <span class="ml-2">{{ item.label }}</span>
          </a>
        </template>
      </Menu>
      <div class="drawer-version">{{ version }}</div>
    </Drawer>
    <div class="nav box">
      <Button
        icon="pi pi-bars"
        size="small"
        aria-label="Open menu"
        @click="showMenu = true"
      />
      <Button
        icon="pi pi-pen-to-square"
        size="small"
        class="nav-add"
        aria-label="Create new ledger"
        @click="store.addLedger()"
      />
    </div>
    <div class="budgetlist">
      <TransitionGroup name="periods">
        <SwipeOut v-for="period in reversePeriods" :key="period.id">
          <template #default>
            <router-link :to="'/budget/' + period.id" class="budgetlist-item">
              <span class="budgetlist-item-title">{{ title(period.ledger) }}</span>
              <span class="budgetlist-item-summary">
                {{ totalSpent(period) }} /
                {{ totalBudget(period) }}
              </span>
            </router-link>
          </template>
          <template #right>
            <button
              class="action-button swipeout-action"
              @click="store.deleteLedger(period)"
            >
              <span class="pi pi-trash action-button-icon"></span>Delete
            </button>
          </template>
        </SwipeOut>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { totalSpent, totalBudget } from "~/assets/scripts";
import { SwipeOut } from "@ahultgren/vue3-swipe-actions";
import { usePeriodStore } from "~/stores/store";

const store = usePeriodStore();

const version = __APP_VERSION__;
const reversePeriods = computed(() => store.periods.slice().reverse());
const showMenu = ref(false);

const menuItems = computed(() => [
  {
    label: "Download backup",
    icon: "pi pi-download",
    url: downloadData({ periods: store.periods }),
    download: "budgeteer-backup.json",
    target: "_blank",
  },
  {
    label: "Import backup",
    icon: "pi pi-upload",
    route: "/import",
  },
]);

const title = (ledger: string) => {
  return ledger.split("\n")[0];
};

function downloadData(data: Record<string, any>) {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  return url;
}
</script>

<style lang="less">
@import "@ahultgren/vue3-swipe-actions/style.css";

.drawer-version {
  position: absolute;
  bottom: 1rem;
  left: 1.25rem;
  font-size: 12px;
  color: #888;
}

.budgetlist {
  &-item {
    text-decoration: none;
    color: inherit;
    margin: 0 10px;
    border-bottom: 1px solid #eee;
    display: block;
    padding: 12px 0;

    &-title {
      display: block;
      margin-bottom: 3px;
    }

    &-summary {
      display: block;
      font-size: 14px;
      color: #666;
    }
  }
}

.nav-add {
  float: right;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 0 3rem;
  cursor: pointer;
  left: 0;

  appearance: none;
  border: none;
  background-color: rgb(255, 59, 48);
  color: white;
  padding: 0 15px;

  &-icon {
    padding-right: 8px;
  }
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
