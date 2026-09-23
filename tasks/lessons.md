# Lessons

## Comments (2026-09-04)

I wrote chatty comments that explained *why* to a reviewer and restated what the code and
test names already said (e.g. `// ponytail: native alert — no toast plumbing needed`).

Rule: a comment earns its place only by telling the reader something the code cannot. Delete
restatements. Put motivation and "why this approach" in the commit message or PR body. Keep only
terse notes about non-obvious external constraints (platform quirks, API footguns, magic-constant
origins). See the "Writing comments" section in CLAUDE.md.

## Non-Baseline CSS needs a check in every target browser (2026-09-23)

I built the search-field fade on CSS scroll-driven animations behind `@supports`, and only tested in
Chromium. Firefox lacks the feature, so the guard skipped the fade and the field showed through the
transparent bar. Safe for the page, broken for the feature. The user found it on first try.

Rule: when a feature depends on something that isn't Baseline (check caniuse), name the browsers that
lack it and the degraded behavior up front, and ask whether those browsers matter. Here the user only
uses Firefox for testing and preferred the CSS version, degradation and all. Don't assume "works
everywhere" beats "zero JS" without asking.
