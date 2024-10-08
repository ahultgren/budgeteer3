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
        { name: "apple-mobile-web-app-capable", content: "yes" },
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
    manifest: {
      name: 'Budgeteer',
      short_name: 'Budgeteer',
      lang: 'en',
    },
    workbox: {
      cachingExtensions: '@/plugins/workbox-sync.js',
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,json,svg,webp,vue}'],
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'NetworkFirst',
        }
      ]
    },
    devOptions: {
      enabled: true,
      type: "module"
    }
  }
});
