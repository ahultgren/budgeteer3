import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

const root = dirname(fileURLToPath(import.meta.url));

function appVersion() {
  const date = new Date().toISOString().slice(0, 10);
  try {
    const sha = execSync("git rev-parse --short HEAD").toString().trim();
    return `${sha} · ${date}`;
  } catch {
    return date;
  }
}

export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(appVersion()),
  },
  resolve: {
    alias: [
      { find: "~", replacement: root },
      { find: "@", replacement: root },
    ],
    // Nuxt resolved extensionless component imports (e.g. `~/components/Ledger`).
    extensions: [".mjs", ".js", ".ts", ".json", ".vue"],
  },
  build: { outDir: "dist" },
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],
      manifest: {
        name: "Budgeteer",
        short_name: "Budgeteer",
        description: "Keep track of your expenses",
        orientation: "portrait",
        categories: ["finance"],
        dir: "ltr",
        lang: "en",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#6A80E6",
        theme_color: "#6A80E6",
        launch_handler: { client_mode: "focus-existing" },
        icons: [48, 72, 96, 128, 144, 152, 192, 256, 384, 512].map((s) => ({
          src: `icons/icon-${s}x${s}.png`,
          sizes: `${s}x${s}`,
          type: "image/png",
        })),
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,svg,webp,woff,woff2,ttf,eot}"],
        navigateFallback: "/",
      },
      devOptions: { enabled: true, type: "module" },
    }),
  ],
});
