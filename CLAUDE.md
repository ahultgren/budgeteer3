# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Build for production
npm run generate   # Static site generation
npm run preview    # Preview production build
```

No test suite exists in this project.

## Architecture

Budgeteer is a **Nuxt 3 PWA** for personal expense tracking. All data lives entirely in the browser — there is no backend. State is persisted to `localStorage` via `pinia-plugin-persistedstate`.

### Data model

`stores/store.ts` defines the single Pinia store. The core types:

- `Period` — one budget period, with a freeform `ledger: string`, a `budget: Record<string, number>` (category → budget amount), and a UUID `id`
- `Budget` — alias for `Record<string, number>`

The `loaded` flag is set after a 500ms delay post-hydration (to avoid SSR/localStorage hydration mismatches) and gates rendering of the period list.

### Ledger format

The ledger is plain text parsed by `assets/scripts.js` using regex:

- `100 food` — adds 100 to the "food" category
- `100sek food` — uses a named currency inline
- `-eur 0.086` — defines a currency conversion rate (currency lines start with `-`)
- Lines starting with `#` are section headers (currently display-only)
- First line of the ledger is used as the period title

`currentCategories()` parses the ledger into category objects `{ name, amount, budget }`. `totalSpent()` and `totalBudget()` aggregate these.

### Pages & routing

- `/` (`pages/index.vue`) — period list with swipe-to-delete, download/import menu
- `/budget/[currentPeriod]` (`pages/budget/[currentPeriod]/index.vue`) — budget detail view, toggles between Ledger and Overview

### Components

- `Ledger.vue` — a `<textarea>` bound directly to `period.ledger`
- `Overview.vue` — parsed category table with inline budget inputs bound to `period.budget[name]`
- `Flip.vue` — CSS flip animation wrapping Ledger/Overview toggle
- `Undo.vue` — toast/button for undoing the last ledger deletion (uses `beforeLastDeletion` state)

### UI

Uses **PrimeVue 4** with a custom Aura preset (violet primary color). Icons via `primeicons`. Swipe actions via `@ahultgren/vue3-swipe-actions`. Styling uses **Less** with scoped styles per component.

## Writing comments

A comment earns its place only by telling the reader something the code cannot.

- Write a comment only when the code isn't clear on its own. If the code already says it, delete the comment — don't restate a call, a type, or a test's name.
- Motivation, justification, and "why this approach" belong in the commit message or PR body, not the source.
- No editorializing ("the important one", "the clever bit") and no history ("used to be X", "fails today").
- A non-obvious external constraint — a platform quirk, an API footgun, where a magic constant comes from — is worth a terse note. State the fact, nothing more.
