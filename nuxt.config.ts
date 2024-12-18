export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
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
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },
  modules: ["@vite-pwa/nuxt"],
  pwa: {
    scope: "/",
    manifest: {
      name: "Budgeteer",
      short_name: "Budgeteer",
      lang: "en",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
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
