import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Button from "primevue/button";
import Menu from "primevue/menu";
import Drawer from "primevue/drawer";
import Toast from "primevue/toast";
import Aura from "@primevue/themes/aura";
import { definePreset } from "@primevue/themes";
import App from "./app.vue";
import { router } from "./router";
import "primeicons/primeicons.css";

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: "{violet.50}",
      100: "{violet.100}",
      200: "{violet.200}",
      300: "{violet.300}",
      400: "{violet.400}",
      500: "{violet.500}",
      600: "{violet.600}",
      700: "{violet.700}",
      800: "{violet.800}",
      900: "{violet.900}",
      950: "{violet.950}",
    },
  },
  components: {
    button: {
      colorScheme: {
        light: { link: { color: "{primary.500}" } },
        dark: { link: { color: "{primary.500}" } },
      },
    },
    toast: {
      colorScheme: {
        light: {
          info: {
            background: "color-mix(in srgb, {primary.50}, transparent 5%)",
            borderColor: "{primary.200}",
            color: "{primary.600}",
            detailColor: "{surface.700}",
            shadow:
              "0px 4px 8px 0px color-mix(in srgb, {primary.500}, transparent 96%)",
          },
        },
        dark: {
          info: {
            background: "color-mix(in srgb, {primary.500}, transparent 84%)",
            borderColor: "color-mix(in srgb, {primary.700}, transparent 64%)",
            color: "{primary.500}",
            detailColor: "{surface.0}",
            shadow:
              "0px 4px 8px 0px color-mix(in srgb, {primary.500}, transparent 96%)",
          },
        },
      },
    },
  },
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(PrimeVue, { theme: { preset: MyPreset } });
app.use(ToastService);
app.component("Button", Button);
app.component("Menu", Menu);
app.component("Drawer", Drawer);
app.component("Toast", Toast);
app.mount("#app");
