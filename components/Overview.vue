<template>
  <div class="overview box">
    <div v-for="item in currentCategories()" :key="item.name" class="overview-category">
      <span class="overview-name">{{ item.name }}</span>
      <span class="overview-amount">{{ Math.round(item.amount) }}</span>
      <span class="overview-divider">/</span>
      <input v-model="period.budget[item.name]" class="overview-budget" />
    </div>
    <div class="overview-total">
      <span class="overview-name">Total:</span>
      <span class="overview-amount">{{ totalSpent(period) }}</span>
      <span class="overview-divider">/</span>
      <span class="overview-budget">{{ totalBudget(period) }}</span>
    </div>

    <div class="chart">
      <svg viewBox="0 0 640 480" class="chart-canvas">
        <polyline fill="none" stroke="#90f" stroke-width="3" :points="overViewChart()" />
      </svg>
    </div>
  </div>
</template>

<script>
import { currentCategories, totalSpent, totalBudget } from "~/assets/scripts";

export default {
  props: ["period"],
  methods: {
    currentCategories() {
      return currentCategories(this.period);
    },
    totalSpent,
    totalBudget,
    overViewChart() {
      const days = this.period.ledger
        .split(/\n/g)
        .slice(1)
        .reduce((arr, line) => {
          const last = arr[arr.length - 1];
          const day = line.match(/^#(.+)/);

          if (day) {
            arr.push({
              name: day[1],
              ledger: "",
            });
          } else if (last) {
            last.ledger += line + "\n";
          }

          return arr;
        }, [])
        .map((day, i) => {
          return [
            i,
            totalSpent({
              ...this.period,
              ledger: day.ledger,
            }),
          ];
        });

      const max = Math.max.apply(
        null,
        days.map(([x, y]) => y)
      );
      const scaled = days.map(([x, y]) => [
        (x / days.length) * 640,
        480 - (y / max) * 480,
      ]);

      console.log(scaled, max);
      return scaled;
    },
  },
};
</script>

<style lang="less">
.overview {
  font-family: monospace;

  &-category,
  &-total {
    display: flex;
  }

  &-category {
    margin-bottom: 10px;
  }

  &-total {
    border-top: 1px solid #ccc;
    margin-top: 17px;
    padding-top: 11px;
  }

  &-amount {
    margin-left: auto;
  }

  &-divider {
    margin: 0 5px;
  }

  &-budget {
    width: 50px;
    padding: 0 0 1px 0;
    border: 0;
    border-bottom: 1px dashed #333;
  }
}

.chart {
  width: 100%;
  height: 0;
  padding-bottom: 62.5%;
  margin-top: 20px;
  position: relative;

  &-canvas {
    width: 100%;
    height: 100%;
    position: absolute;
  }
}
</style>
