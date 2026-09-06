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
const transition = ref("page");
useRouter().afterEach((to, from) => {
  transition.value = to.meta.slide ? "push" : from.meta.slide ? "pop" : "page";
});
</script>

<style>
html {
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

/* Push (open budget): incoming page slides in from the right, on top; the page
   underneath stays put. Pop (back): outgoing page slides off to the right,
   revealing the stationary page beneath. Only the budget page ever moves. */
.push-enter-active,
.pop-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2;
  /* Opaque (matching the page background, incl. dark) so the sliding page fully
     covers the one beneath it. `Canvas` is the system default background color. */
  background-color: Canvas;
  transition: transform 0.35s cubic-bezier(0.35, 0.01, 0.43, 0.99);
}
.push-enter-from,
.pop-leave-to {
  transform: translateX(100%);
}
/* Keep the stationary page mounted underneath for the duration of the slide. */
.push-leave-active,
.pop-enter-active {
  transition: transform 0.35s;
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
