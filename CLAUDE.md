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

Entry is `main.ts` (creates the app, registers Pinia + persist plugin and Vue Router, imports `main.css`) → `app.vue` (root, wraps `<router-view>` in a `<transition>`, mounts `Undo`, and provides the reka-ui `ToastProvider`/`ToastViewport`). Routes are declared in `router.ts`.

### Data model

`stores/store.ts` defines the single Pinia store. The core types:

- `Period` — one budget period, with a freeform `ledger: string`, a `budget: Record<string, number>` (category → budget amount), and a UUID `id`
- `Budget` — alias for `Record<string, number>`

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

- `Ledger.vue` — a `<textarea>` bound directly to `period.ledger`, with a search-highlight mirror behind it
- `Overview.vue` — parsed category table with inline budget inputs bound to `period.budget[name]`
- `Flip.vue` — CSS flip animation wrapping Ledger/Overview toggle
- `Undo.vue` — toast/button for undoing the last ledger deletion (uses `beforeLastDeletion` state)

### Search

`findMatches(text, query)` in `assets/scripts.js` returns matching lines with line-relative ranges (case- and accent-insensitive, but å/ä/ö stay distinct; multi-word = AND on the same line). The query lives in the URL (`/?q=`, `/budget/:id?q=`).

- Home: the field sits under the TopBar and starts scrolled out of view. A CSS scroll-driven animation (`view()` timeline inset by the 68px TopBar) fades it out under the transparent bar; browsers without scroll-driven animations (Firefox) just show it through the bar, and `index.html` has proximity scroll-snap to shown/hidden (`scroll-pt-[68px]` = TopBar height).
- Ledger: a transparent-text mirror `<div>` behind the transparent textarea is painted with `CSS.highlights` / `::highlight(search)`, and hidden while the textarea is focused. It shares the textarea's exact text-box classes; `tests/e2e/search.spec.ts` pixel-diffs the two layers to guard alignment.

### UI

Dark-only iOS-Notes look, purple accent. Styling is **Tailwind v4** (`@tailwindcss/vite`, entry `main.css` with an `@theme` palette — `--color-accent` is the single retint knob). The menu drawer and the undo toast use **reka-ui** headless primitives (`Dialog`, `Toast`); icons via **`@lucide/vue`**. Swipe actions via `@ahultgren/vue3-swipe-actions`. Tailwind Preflight handles resets (no hand-rolled `*{margin:0}`). `less` is still a devDep — `index.vue` uses nested `<style lang="less">` for the swipe/keyframe CSS.

Note: Vite code-splits CSS per route. Tailwind utilities are global (imported in `main.ts`) so they're always present — but a component's `<style>` keyframes/classes exist only when that component's chunk is loaded. Shared non-scoped layout (`.container`, the router-transition classes) lives in `app.vue`; the swipe-animation CSS + drawer keyframes live in `index.vue` (only used there).

## Build & deploy

Static build to `dist/`, deployed to GitHub Pages at the custom domain `budgeteer.andreashultgren.se` (served at root, so Vite `base` is `/`). `.github/workflows/deploy.yml` builds with pnpm and publishes `dist/` via GitHub Actions. `public/CNAME` sets the custom domain; `build` copies `index.html`→`404.html` so client-side deep links (e.g. `/budget/:id`) resolve on hard refresh. `vite-plugin-pwa` generates the service worker + manifest.

## Writing comments

A comment earns its place only by telling the reader something the code cannot.

- Write a comment only when the code isn't clear on its own. If the code already says it, delete the comment — don't restate a call, a type, or a test's name.
- Motivation, justification, and "why this approach" belong in the commit message or PR body, not the source.
- No editorializing ("the important one", "the clever bit") and no history ("used to be X", "fails today").
- A non-obvious external constraint — a platform quirk, an API footgun, where a magic constant comes from — is worth a terse note. State the fact, nothing more.
