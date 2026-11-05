# Conventions (ICM Layer 3) — project-specific instances

Quality standards are owned canonically by `vibe-code-rules.md` (repo root).
This file records the concrete values this project commits to, so no other
file repeats or contradicts them. Runtime constants (mime list, timeslice,
filename format) live canonically in `src/config.ts` once stage 02 creates
it — not here.

## Spacing scale

4 / 8 / 12 / 16 / 24 / 32 / 48 px. All margins, paddings, and gaps use one of
these values. No other spacing values appear in CSS.

## Typography

One font family: the system UI stack (`system-ui, -apple-system, "Segoe UI",
Roboto, sans-serif`). No webfont downloads. Headings and body differ only in
weight and size.

## Color

Neutral grays, one accent for the recording state (red family), one success
color (green). Body text contrast >= 4.5:1. No gradients, no glassmorphism,
no purple-dominant palettes.

## Naming

- Files: kebab-case (`capture-source.ts`).
- Functions and variables: camelCase, descriptive (`getElapsedMs`, not `getData`).
- Types and interfaces: PascalCase (`RecordingSession`).
- Constants: SCREAMING_SNAKE_CASE, defined in `src/config.ts`.

## Commits

`type: short description` with types: feat, fix, chore, docs, refactor, test.
Branches: `feature/|fix/|experiment/` + lowercase-hyphen description.

## UI copy rules

Specific CTAs ("Start recording", not "Get started"). No emojis anywhere.
No marketing adjectives. Error messages state what happened and what to do
next. Loading states describe what is in progress ("Waiting for screen-share
permission…").

## Stage file limits (ICM)

Stage CONTEXT.md <= 80 lines. Reference files <= 200 lines. One-way
references: if A references B, B never references A.
