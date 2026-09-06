<template>
  <div>
    <router-view v-slot="{ Component }">
      <transition :name="transition">
        <component :is="Component" />
      </transition>
    </router-view>
    <Undo />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Undo from "~/components/Undo.vue";

// Only the budget detail (meta.slide) animates: it pushes in over the stationary
// list, and pops back off it. Other navigations fade.
//
// Browser-initiated back (iOS Safari edge-swipe or the back button) plays Safari's
// own native slide. There we use the "back" transition, which doesn't animate but
// pushes the outgoing page behind (z-index) so it can't flash on top for a frame
// when Safari reveals the live DOM at the end of its native animation. Our own slide
// is only for in-app navigation (tapping a budget or the "< Budgets" button, both
// router pushes). Vue Router tracks a monotonic `position` in history.state: it
// decreases on back and increases on push, which distinguishes the two reliably
// (a popstate listener races Vue Router's own and fires too late).
const transition = ref("page");
let lastPosition = (typeof window !== "undefined" && window.history.state?.position) || 0;
useRouter().afterEach((to, from) => {
  const position = (typeof window !== "undefined" && window.history.state?.position) || 0;
  const wentBack = position < lastPosition;
  lastPosition = position;
  if (wentBack) {
    transition.value = "back";
  } else {
    transition.value = to.meta.slide ? "push" : from.meta.slide ? "pop" : "page";
  }
});
</script>

<style>
html {
  /* Opt into both schemes so the `Canvas` background color (and UA controls)
     follow the OS. WebKit resolves `Canvas` to white without this, even in dark. */
  color-scheme: light dark;
  font-family: "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  /* Opaque (matching the page background, incl. dark) so a page always covers what
     is beneath it during a transition. `Canvas` is the system default background. */
  background-color: Canvas;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s ease-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.page-enter-active {
  position: absolute;
  width: 100%;
  top: 0;
}

/* Push (open budget): the budget slides in from the right on top of the stationary
   list. Pop (back): the budget slides off to the right, revealing the list beneath.
   Both pages are absolutely positioned and overlapping during the slide. */
.push-enter-active,
.push-leave-active,
.pop-enter-active,
.pop-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
/* The moving (budget) page rides on top. */
.push-enter-active,
.pop-leave-active {
  z-index: 2;
  transition: transform 0.35s cubic-bezier(0.35, 0.01, 0.43, 0.99);
}
.push-enter-from,
.pop-leave-to {
  transform: translateX(100%);
}
/* The stationary page is held below (negative z-index) for the slide's duration.
   Without this it briefly paints on top when the incoming page drops back to normal
   flow at the end of the transition — a one-frame flash of the previous page. */
.push-leave-active,
.pop-enter-active {
  z-index: -1;
  transition: transform 0.35s;
}

/* Native back (Safari swipe): don't animate, but keep the outgoing page behind so it
   can't flash on top for a frame as Safari finishes its own native slide. */
.back-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: -1;
}
</style>

<style lang="less">
/* Shared layout primitives used across pages (list + budget). Global, not scoped —
   Nuxt bundled all component CSS eagerly; Vite code-splits per route, so these must
   live here to stay present on every page. */
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
.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}

.box {
  padding: 10px;
}
.btn {
  appearance: none;
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
