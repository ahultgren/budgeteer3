import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    { path: "/", component: () => import("~/pages/index.vue") },
    { path: "/import", component: () => import("~/pages/import.vue") },
    {
      path: "/budget/:currentPeriod",
      component: () => import("~/pages/budget/[currentPeriod]/index.vue"),
      meta: { slide: true },
    },
  ],
});

// In-app "back to the list" behaves like native back, so the history stack never grows past
// list → page (pushing "/" would let back step into an old ledger). A deep link has no list entry
// behind it, so it replaces itself with the list instead.
let animateBack = false;
export function backToList() {
  const back = window.history.state?.back;
  if (back && router.resolve(back).path === "/") {
    animateBack = true;
    router.back();
  } else {
    router.replace("/");
  }
}

export function consumeAnimateBack() {
  const animate = animateBack;
  animateBack = false;
  return animate;
}
