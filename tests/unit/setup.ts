// Nuxt injects these as auto-imports at runtime. Plain Vitest doesn't, so `store.ts`
// (which uses bare `ref` and `piniaPluginPersistedstate`) would throw ReferenceError on
// import. We replicate just those two globals here. After the Vite migration these become
// explicit imports in store.ts and this shim shrinks — but the tests below stay identical,
// which is the whole point: they prove the store behaves the same before and after.
import { ref, computed } from "vue";

(globalThis as any).ref = ref;
(globalThis as any).computed = computed;
// persist config is a Pinia custom option; without the plugin installed Pinia ignores it.
// We only need `.localStorage()` to not throw when the store module is evaluated.
(globalThis as any).piniaPluginPersistedstate = {
  localStorage: () => undefined,
};
