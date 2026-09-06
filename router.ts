import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", component: () => import("~/pages/index.vue") },
    { path: "/import", component: () => import("~/pages/import.vue") },
    {
      path: "/budget/:currentPeriod",
      component: () => import("~/pages/budget/[currentPeriod]/index.vue"),
      meta: { transition: "slideInOut" },
    },
  ],
});
