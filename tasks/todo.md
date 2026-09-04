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
