<template>
  <div v-if="periods[currentPeriod]" class="container">
    <div class="nav box">
      <nuxt-link class="btn" to="/">&lt; Budgets</nuxt-link>
      <button class="nav-view btn" @click="toggleView()">
        Show {{ currentView === "Ledger" ? "summary" : "ledger" }}
      </button>
    </div>

    <component :is="currentView" :period="periods[currentPeriod]"></component>
  </div>
</template>

<script>
import Ledger from "~/components/Ledger";
import Overview from "~/components/Overview";

export default {
  components: {
    Ledger,
    Overview,
  },
  data() {
    return {
      currentView: "Ledger",
      periods: [],
      currentPeriod: this.$route.params.currentPeriod,
    };
  },
  watch: {
    periods: {
      handler(val) {
        localStorage.periods = JSON.stringify(val);
      },
      deep: true,
    },
    currentPeriod(val) {
      localStorage.currentPeriod = JSON.stringify(val);
    },
  },
  mounted() {
    if (localStorage.periods) {
      try {
        this.periods = JSON.parse(localStorage.periods);
      } catch (e) {
        console.error(e);
      }
    }
  },
  methods: {
    toggleView() {
      this.currentView = this.currentView === "Ledger" ? "Overview" : "Ledger";
    },
  },
};
</script>

<style lang="less">
* {
  box-sizing: border-box;
}

body {
  font-size: 16px;
}
textarea,
input,
button {
  font-size: inherit;
}

.nav {
  position: sticky;
  background: rgba(245, 248, 255, 95%);
  z-index: 1;
  left: 0;
  top: 0;
  right: 0;

  &-view {
    float: right;
  }
}

.box {
  padding: 10px;
}
.btn {
  -moz-appearance: none;
  -webkit-appearance: none;
  background: transparent;
  border: none;
  padding: 2px 0px;
  display: inline-block;
  text-decoration: none;
  color: #003eb4;
  font-family: inherit;
  font-weight: 600;
}
</style>
