import Aura from "@primevue/themes/aura";
import { definePreset } from "@primevue/themes";

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
        light: {
          link: {
            color: "{primary.500}",
          },
        },
        dark: {
          link: {
            color: "{primary.500}",
          },
        },
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

export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    pageTransition: { name: "page" },
    head: {
      title: "Budgeeter",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=1",
        },
        { name: "mobile-web-app-capable", content: "yes" },
        {
          hid: "description",
          name: "description",
          content: process.env.npm_package_description || "",
        },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
        {
          rel: "apple-touch-startup-image",
          media:
            "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
          href: "splash_screens/iPhone_11__iPhone_XR_portrait.png",
        },
      ],
    },
  },
  modules: [
    "@vite-pwa/nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@primevue/nuxt-module",
  ],
  primevue: {
    options: {
      theme: {
        preset: MyPreset,
      },
    },
  },
  pwa: {
    scope: "/",
    manifest: {
      name: "Budgeteer",
      short_name: "Budgeteer",
      description: "Keep track of your expenses",
      launch_handler: {
        client_mode: "focus-existing",
      },
      orientation: "portrait",
      categories: ["finance"],
      dir: "ltr",
      lang: "en",
      start_url: "/",
      display: "standalone",
      background_color: "#6A80E6",
      theme_color: "#6A80E6",
      icons: [
        {
          src: "icons/icon-48x48.png",
          sizes: "48x48",
          type: "image/png",
        },
        {
          src: "icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          src: "icons/icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "icons/icon-128x128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
        },
        {
          src: "icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon-256x256.png",
          sizes: "256x256",
          type: "image/png",
        },
        {
          src: "icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,json,svg,webp,vue}"],
      runtimeCaching: [
        {
          urlPattern: "**/*.{js,css,html,json,svg,webp,vue}",
          handler: "CacheFirst",
        },
      ],
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
  nitro: {
    prerender: {
      autoSubfolderIndex: true,
      concurrency: 4,
      interval: 1,
      failOnError: true,
      crawlLinks: true,
      ignore: [],
      routes: ["/"],
      retry: 3,
      retryDelay: 1000,
    },
  },
});
