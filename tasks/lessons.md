# Lessons

## Comments (2026-09-04)

I wrote chatty comments that explained *why* to a reviewer and restated what the code and
test names already said (e.g. `// ponytail: native alert — no toast plumbing needed`).

Rule: a comment earns its place only by telling the reader something the code cannot. Delete
restatements. Put motivation and "why this approach" in the commit message or PR body. Keep only
terse notes about non-obvious external constraints (platform quirks, API footguns, magic-constant
origins). See the "Writing comments" section in CLAUDE.md.
