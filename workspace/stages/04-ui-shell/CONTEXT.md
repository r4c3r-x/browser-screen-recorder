# Stage 04 — UI shell

One stage, one job: the only stage allowed to touch the DOM. Controls, status
panel, error banner, live preview, and styles, wired to the RecordingSession.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/03-audio-mixing/output/stage-report.md | Full | Session API to bind |
| Layer 3 | workspace/_config/conventions.md | All | Spacing/copy/naming rules |
| Layer 4 | index.html, src/main.ts | Full | Shell to extend |

## Process

1. index.html: semantic structure — controls, status, preview, and banner
   regions.
2. src/ui/controls.ts: start/pause/resume/stop/download/discard; enabled
   strictly from session state; loading state while permission is pending.
3. src/ui/status-panel.ts: state chip, elapsed timer (excludes pauses), live
   size, mime badge.
4. src/ui/error-banner.ts: dismissible, actionable messages (permission
   denied, unsupported browser, mic notice).
5. src/styles/base.css: spacing scale, one font stack, contrast-safe colors.
6. main.ts: composition root; beforeunload guard while recording.
7. Manual pass in `npm run dev`: full happy path plus each failure path
   listed in PLAN.md.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| UI | src/ui/*, src/styles/base.css, index.html | mixed |

## Audit

- [ ] Every async operation has a visible loading state; every failure has a visible error state
- [ ] No emojis; copy follows conventions.md; CTAs specific
- [ ] Spacing only from the scale; single font family
- [ ] Disabled-state logic derives from session state (no ad-hoc booleans)

## Checkpoint

Manual click-through matrix passed; report written; then stage 05.
