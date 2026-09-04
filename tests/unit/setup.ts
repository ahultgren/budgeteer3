// store.ts relies on Nuxt auto-imports; supply them as globals so it imports under plain Vitest.
import { ref, computed } from "vue";

(globalThis as any).ref = ref;
(globalThis as any).computed = computed;
(globalThis as any).piniaPluginPersistedstate = {
  localStorage: () => undefined,
};
