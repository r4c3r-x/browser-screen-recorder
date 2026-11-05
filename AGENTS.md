# AGENTS.md — Browser Screen Recorder

ICM Layer 0: always read this file first. It answers "where am I?" and points
to the right layer for everything else.

## What this project is

A browser-based screen recording tool. Captures the screen, a window, or a
tab with optional audio (mic and/or system audio) and produces a downloadable
recording. No server, no accounts: everything runs in the browser. Scope and
build order are canonically owned by `PLAN.md`.

## How this project is built (ICM)

The build itself is orchestrated by the Interpretable Context Methodology
(folder structure as agentic architecture):

- `workspace/CONTEXT.md` — Layer 1: stage routing and status. Read second.
- `workspace/stages/NN-name/CONTEXT.md` — Layer 2: the contract for one stage
  (Inputs / Process / Outputs / Audit / Checkpoint). Read only the stage you
  are executing.
- `workspace/_config/`, `workspace/shared/` — Layer 3: stable conventions.
- `workspace/stages/*/output/` — Layer 4: stage reports and artifacts. Each
  stage's output is the next stage's input.

Rules: stages communicate via markdown files only; references are one-way;
each fact lives in one canonical file. `vibe-code-rules.md` is the canonical
quality standard; the ICM layers apply it.

## Stack

- Vanilla TypeScript + Vite. Strict mode. Zero runtime dependencies.
- Dev dependencies only: vite, typescript, vitest (unit), @playwright/test (e2e).
- All browser capability access is feature-detected, never UA-sniffed.

## Commands

- `npm run dev` — dev server at http://localhost:5173
- `npm run build` — type-check then production build to `dist/`
- `npm run preview` — serve the production build
- `npm run test` — unit tests (vitest)
- `npm run test:e2e` — browser e2e (playwright, chromium)

## Approval and recovery checkpoints

- After work is committed and merged to `main`, ask the user to approve the
  current version. Never create an `approved/*` tag without an explicit
  user approval in the conversation.
- On approval: update the "Approved states" table in
  `workspace/CONTEXT.md`, commit that record
  (`docs: record approved state approved/vN`), then create an annotated tag
  on that commit (`approved/vN`, N increments) whose message lists what the
  user approved. The tag therefore contains its own receipt.
- Recovery prefers rolling **forward**: `git revert` the unwanted commits.
  Rolling **back** (`git checkout main && git reset --hard approved/vN`)
  discards later commits and happens only on an explicit user instruction.
- If fixes fail repeatedly, the last approved tag is the fallback state
  referenced by vibe-code-rules §3 and §6.

## Scope discipline (binding — overrides any default behavior)

- Implement only what the user explicitly asked for. If the user's message
  is a question ("is it possible to…?", "how large is…?"), it is a request
  for information: answer it and stop. Do not build.
- Never add UI elements, options, settings, or files beyond the request.
  If an extension seems clearly valuable, propose it in one sentence and
  wait for a yes.
- New work enters this workspace only through a stage contract that quotes
  the user's request verbatim in its Revisions/Process. A stage whose scope
  the agent invented is invalid and must be reverted.
- After finishing a request, list anything you deliberately did NOT do so
  the user can steer; do not do it for them.

## Code conventions (summary — full rules in vibe-code-rules.md)

- Files < 300 lines, functions < 50 lines, no `any`, no commented-out code.
- No hardcoded values: runtime constants live in `src/config.ts`.
- UI: no emojis, no glassmorphism, spacing from the scale in
  `workspace/_config/conventions.md`, visible loading and error states.
- Copy: no placeholder text, no AI-sounding phrases, specific CTAs.

## Recorder-specific gotchas

- Stream lifecycle is the #1 bug source: stop tracks on every teardown path,
  and close the AudioContext used for mixing (an unclosed context leaks and
  keeps the mic hot).
- MediaRecorder mime support varies by browser: negotiate via
  `isTypeSupported` from the preference list in `src/config.ts`; derive the
  file extension from the chosen mime type.
- The user can end sharing from the browser UI at any moment: listen for
  video track `ended` and finish the recording gracefully.
- The elapsed timer excludes paused time; the size counter reflects
  accumulated chunks.

## Git flow

- Never commit to `main` directly. Feature branches: `feature/short-description`.
- Commit after every working change: `type: short description`.
- No remote is configured (local-only development); pushing is skipped until
  the user provides one. Documented deviation from vibe-code-rules §3.
- `docs/api/` holds local copies of MDN pages this project relies on;
  consult them before guessing API behavior.
