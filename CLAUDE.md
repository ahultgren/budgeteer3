# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Build for production to dist/ (+ copies index.html -> 404.html)
npm run preview    # Preview production build (localhost:3000)
npm run test       # Unit (Vitest) + e2e (Playwright); or test:unit / test:e2e
```

## Architecture

Budgeteer is a **Vite + Vue 3 SPA** (installable PWA via `vite-plugin-pwa`) for personal expense tracking. There is no SSR and no backend — all data lives in the browser, persisted to `localStorage` via `pinia-plugin-persistedstate`.

Entry is `main.ts` (creates the app, registers Pinia + persist plugin, Vue Router, PrimeVue, and the PrimeVue components used in templates) → `app.vue` (root, wraps `<router-view>` in a `<transition>` and mounts `Undo`). Routes are declared in `router.ts`.

### Data model

`stores/store.ts` defines the single Pinia store. The core types:

- `Period` — one budget period, with a freeform `ledger: string`, a `budget: Record<string, number>` (category → budget amount), and a UUID `id`
- `Budget` — alias for `Record<string, number>`

The `loaded` flag is set after a 500ms delay once the persisted state has hydrated, and gates rendering of the period list. It is omitted from persistence (`persist.omit`) and set in `persist.afterHydrate`.

### Ledger format

The ledger is plain text parsed by `assets/scripts.js` using regex:

- `100 food` — adds 100 to the "food" category
- `100sek food` — uses a named currency inline
- `-eur 0.086` — defines a currency conversion rate (currency lines start with `-`)
- Lines starting with `#` are section headers (currently display-only)
- First line of the ledger is used as the period title

`currentCategories()` parses the ledger into category objects `{ name, amount, budget }`. `totalSpent()` and `totalBudget()` aggregate these.

### Pages & routing

Routes are hand-declared in `router.ts` (`createWebHistory("/")`, lazy-imported page components):

- `/` (`pages/index.vue`) — period list with swipe-to-delete, download/import menu
- `/budget/:currentPeriod` (`pages/budget/[currentPeriod]/index.vue`) — budget detail view, toggles between Ledger and Overview; route meta sets the `slideInOut` transition
- `/import` (`pages/import.vue`) — restore from a backup JSON file

The `[currentPeriod]` directory name is a leftover from Nuxt's file-based routing; the file is just a normal component now.

### Components

- `Ledger.vue` — a `<textarea>` bound directly to `period.ledger`
- `Overview.vue` — parsed category table with inline budget inputs bound to `period.budget[name]`
- `Flip.vue` — CSS flip animation wrapping Ledger/Overview toggle
- `Undo.vue` — toast/button for undoing the last ledger deletion (uses `beforeLastDeletion` state)

### UI

Uses **PrimeVue 4** with a custom Aura preset (violet primary color, defined in `main.ts`). Icons via `primeicons`. Swipe actions via `@ahultgren/vue3-swipe-actions`. Styling uses **Less**. Note: Vite code-splits CSS per route, so shared **non-scoped** layout styles (`.nav`, `.box`, `.btn`, base resets) live in `app.vue`'s global `<style>` — putting them in a route component's non-scoped block would make them vanish on pages that haven't loaded that chunk.

## Build & deploy

Static build to `dist/`, deployed to GitHub Pages at the custom domain `budgeteer2.andreashultgren.se` (served at root, so Vite `base` is `/`). `.github/workflows/deploy.yml` builds with pnpm and publishes `dist/` via GitHub Actions. `public/CNAME` sets the custom domain; `build` copies `index.html`→`404.html` so client-side deep links (e.g. `/budget/:id`) resolve on hard refresh. `vite-plugin-pwa` generates the service worker + manifest.

## Writing comments

A comment earns its place only by telling the reader something the code cannot.

- Write a comment only when the code isn't clear on its own. If the code already says it, delete the comment — don't restate a call, a type, or a test's name.
- Motivation, justification, and "why this approach" belong in the commit message or PR body, not the source.
- No editorializing ("the important one", "the clever bit") and no history ("used to be X", "fails today").
- A non-obvious external constraint — a platform quirk, an API footgun, where a magic constant comes from — is worth a terse note. State the fact, nothing more.
