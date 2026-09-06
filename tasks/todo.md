# Migration safety net

Goal: a test suite that runs on the **current Nuxt app** (baseline) and **unchanged** on the
future Vite app, so any behavior/visual/offline difference during migration shows up as a
failing test. I own proving the migration is safe; this suite is the proof.

## Layers

- [ ] **Unit (Vitest)** — complete coverage of the pure logic that must not drift
  - [ ] `assets/scripts.js` parser: every branch + edge case (currency, negatives, decimals,
        multi-word category, unknown currency, malformed, empty, sort, budget mapping)
  - [ ] `stores/store.ts` actions: add / delete / undo (incl. double-delete) / getLedgerById
- [ ] **Integration + regression (Playwright, runs against the built app + real SW)**
  - [ ] Import fixture → reload (persistence) → export → **deep-equal round-trip**
  - [ ] Screenshot every screen (list / ledger / overview / import) = before-migration baseline
  - [ ] **Offline**: register SW, `setOffline(true)`, reload, assert app works + no failed
        requests for critical assets (js/css/fonts). This catches the woff-not-cached bug.

## Bugs the net exposes (fix to get a GREEN baseline)

- [ ] Export/import format mismatch — export a bare array, import expects `{periods}`.
      Round-trip is broken today. Fix: export `{ periods }`.
- [ ] Offline fonts — globPatterns omits `woff2,woff,ttf,eot`. Fix the glob + runtimeCaching.
- [ ] `import.vue` has no error handling — malformed JSON crashes the app. Add try/catch + validate.
- [ ] Dead `apple-touch-startup-image` link → 404 (file doesn't exist). Remove it.

## Order

1. Unit layer green (fast, deterministic) — DONE gate: `npm run test:unit` passes.
2. Playwright layer set up + baseline screenshots captured against Nuxt build.
3. Fix the 4 bugs → whole suite green = trustworthy baseline.
4. (Later, separate) Migrate to Vite; re-run identical suite; diff screenshots; must stay green.

## Review — DONE (baseline is green)

Built and verified on the **current Nuxt app**:

- **Unit (Vitest v2):** 30 tests, all green. `tests/unit/scripts.test.js` (22) fully characterizes
  the ledger parser incl. currency defaults, unknown-currency NaN, multi-word category, budget
  coercion; `tests/unit/store.test.ts` (8) covers add/delete/undo/single-level-undo/getById.
  A tiny shim (`tests/unit/setup.ts`) supplies the two Nuxt auto-imports the store uses so it
  imports under plain Vitest — after migration these become real imports and the tests are unchanged.
- **Playwright (mobile-chromium, against the production build + real SW):** 7 tests, all green.
  - round-trip: import fixture → reload → export → deep-equal. 
  - offline: install SW online, `setOffline`, reload, assert no critical asset (js/css/fonts) 404s.
  - 4 screenshot baselines: list / ledger / overview / import.

The net earned its keep immediately — it went RED on two real, pre-existing bugs, which are now fixed:

1. **Export/import mismatch** (`pages/index.vue`) — export wrote a bare array, import expected
   `{periods}`; backups couldn't be re-imported. Fixed to export `{ periods }`.
2. **Offline fonts** (`nuxt.config.ts`) — primeicons woff/ttf weren't in the precache glob; icons
   vanished offline. Added `woff,woff2,ttf,eot` to globPatterns + runtimeCaching.
3. **Import crash** (`pages/import.vue`) — malformed JSON crashed the app; added try/catch + validation.
4. **Dead splash-screen link** (`nuxt.config.ts`) — removed a 404ing `apple-touch-startup-image`.

## The migration gate (how this proves safety)

Run before starting, keep it green throughout:

```
npm run test:unit          # pure logic — must stay identical
npm run test:e2e           # round-trip + offline + screenshot diff vs baseline
```

During the Nuxt→Vite migration, the ONLY expected change is `playwright.config.ts` webServer
(`generate && preview` → `vite build && vite preview`) and `tests/unit/setup.ts` shrinking as the
store gains explicit imports. Everything else — every assertion, every screenshot — must stay green.
Any red = a regression, caught before it ships.

Notes / follow-ups (not blockers):
- Screenshot baselines are `-darwin` (captured locally, which is where the before/after diff runs).
  Add Linux baselines only if you wire this into GitHub Actions CI.
- Blob-URL leak in the download menu is minor (valid downloads, small leak) — left as-is.
- GitHub Pages will need the `404.html` SPA-fallback trick + a `base` path; Nuxt's `nuxt preview`
  masks this locally because it serves `200.html`. Handle at deploy time.

---

# Nuxt → Vite SPA migration plan

Deploy target: **root** (custom domain / user site) → base `/`. Pure client SPA, no SSR.
Gate: the migration net stays green throughout. Only `playwright.config.ts` webServer and
`tests/unit/setup.ts` are allowed to change.

## New files
- [ ] `index.html` (repo root) — replaces `app.head`: charset, viewport (`maximum-scale=1`),
      `mobile-web-app-capable`, description, favicon link, `<div id="app">`, `<script type=module src=/main.ts>`.
- [ ] `main.ts` — `createApp(App)`; register pinia + `pinia-plugin-persistedstate`; router;
      PrimeVue plugin with `MyPreset` (moved out of nuxt.config); `ToastService`; globally register
      the auto-imported PrimeVue components used in templates (`Button`, `Menu`, `Drawer`, `Toast`);
      `import "primeicons/primeicons.css"`; `mount("#app")`.
- [ ] `App.vue` — replaces `app.vue` (no layouts dir → no NuxtLayout needed). `<router-view>` wrapped
      in `<transition :name="route.meta.transition ?? 'page'">`; render `<Undo/>`. Carry over the
      global `<style>` verbatim.
- [ ] `router.ts` — `createRouter(createWebHistory("/"))`, 3 routes: `/`→index, `/import`→import,
      `/budget/:currentPeriod`→budget (meta.transition `slideInOut`).
- [ ] `vite.config.ts` — `vue()`, `VitePWA({...})`; `resolve.alias` `~`+`@`→root;
      `resolve.extensions` add `.vue` (extensionless `~/components/Ledger` imports); base `/`.
      Less works with no config (`less` already installed).

## Edited source (minimal)
- [ ] `stores/store.ts` — add `import { ref } from "vue"`; `piniaPluginPersistedstate.localStorage()`
      → lazy storage via explicit import (must not touch `localStorage` at import time — node unit tests);
      `import.meta.client` → `typeof window !== "undefined"`.
- [ ] `pages/index.vue` — add `ref` to the vue import; `nuxt-link`→`router-link`.
- [ ] `pages/budget/[currentPeriod]/index.vue` — `nuxt-link`→`router-link`; drop `definePageMeta`
      (transition now lives in route meta).
- [ ] `pages/import.vue` — `nuxt-link`→`router-link`.
- [ ] `components/Undo.vue` — `useToast` → `import { useToast } from "primevue/usetoast"`.

## package.json
- [ ] Remove: `nuxt`, `@pinia/nuxt`, `@vite-pwa/nuxt`, `@primevue/nuxt-module`, `unimport`,
      `vue3-swipe-actions` (unused dup of the scoped pkg).
- [ ] Add: `vite`, `@vitejs/plugin-vue`, `vite-plugin-pwa`.
- [ ] Keep: vue, vue-router, pinia, pinia-plugin-persistedstate, primevue, @primevue/themes,
      primeicons, ramda, uuid, @ahultgren/vue3-swipe-actions, less.
- [ ] Scripts: `dev`→`vite`, `build`→`vite build`, `preview`→`vite preview --port 3000`;
      drop `generate`/`start`/`postinstall`.
- [ ] Delete `nuxt.config.ts`, `.nuxt/`, `.output/`, the `dist` symlink (dist = vite outDir).

## Tests (the gate)
- [ ] `playwright.config.ts` webServer: `generate && preview` → `build && preview` (serves :3000).
- [ ] `tests/unit/setup.ts` — shrink/remove (store now imports `ref` + storage explicitly).
- [ ] Screenshots must match; a real visual diff is a regression — investigate before `--update-snapshots`.

## Order (tests runnable after each step)
1. Add vite deps + `vite.config.ts` + `index.html` + `main.ts` + `App.vue` + `router.ts` (nuxt still present).
2. Port the source edits above.
3. `npm run dev` smoke: list, add, delete+undo, open budget, toggle view, edit ledger, edit overview
   budget, export, import, reload (persistence).
4. Wire `vite-plugin-pwa`; verify SW + manifest + offline.
5. Flip package.json scripts; delete nuxt.config + `.nuxt`/`.output` + nuxt deps.
6. Update playwright webServer + setup.ts; run `npm run test` (unit + e2e); diff screenshots. Green = done.
7. Postbuild: copy `dist/index.html`→`dist/404.html` for SPA deep-link fallback.

## Gotchas
- Keep the `loaded` 500ms behavior identical or the list screenshot timing drifts.
- Persist storage must be lazy so importing the store under node (unit tests) doesn't hit `localStorage`.
- PWA `<link rel=manifest>` is injected at build; enable `devOptions` if you want PWA in `dev`.

## Review — DONE (migration complete, net stayed green)

Executed on 2026-09-06. Gate: **30 unit + 7 e2e = 37 tests green** on the Vite SPA,
matching the Nuxt baseline (same assertions, same 4 screenshots, same offline behavior).

New files: `vite.config.ts`, `index.html`, `main.ts`, `router.ts`; `app.vue` rewritten to
`<router-view>`+`<transition>`. Source edits: `nuxt-link`→`router-link`, explicit `useToast`
import, `store.ts` de-Nuxted (`ref` import, `typeof window` guards, lazy `localStorage`), `Flip`
imported explicitly, `.vue` added to extensionless component imports. Deleted `nuxt.config.ts`,
`.nuxt/`, `.output/`, the `dist` symlink, `tests/unit/setup.ts`. Dropped 5 Nuxt deps + the unused
`vue3-swipe-actions` dup; added `vite`, `@vitejs/plugin-vue`, `vite-plugin-pwa`. `build` copies
`index.html`→`404.html` for the SPA deep-link fallback.

Deviations / findings:
- **vue-router pinned at 5.0.4, pinia at 2.3.1.** Vue Router 5 (current) peer-wants pinia 3, but
  only for the unused data-loader feature; pinia 2 (baseline-proven) works. Peer warnings are cosmetic.
- **Vite pinned to 7**, not the just-released 8 — `@vitejs/plugin-vue@6` declares peer `vite ^6||^7`.
- **CSS scope regression caught by the net** (not in the original plan): the budget page's non-scoped
  `<style>` (`.nav`/`.box`/`.btn`) was effectively global under Nuxt's eager CSS bundling; Vite
  code-splits CSS per route, so the list page lost its nav padding/background until `/budget` loaded.
  Fixed by moving those shared primitives into `app.vue`'s global style. The list screenshot diff is
  exactly what surfaced this — the net earned its keep again.
- `.npmrc` `shamefully-hoist` left in place (still relevant for PrimeVue hoisting under pnpm); its
  comment still mentions Nuxt but is harmless.
