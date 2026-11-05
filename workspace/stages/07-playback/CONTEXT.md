# Stage 07 — playback

One stage, one job: after a recording finishes, let the user watch it in the
app before downloading or discarding. Native video controls only (no player
library: play/seek/volume already exist in the platform; a custom player
would be scope creep).

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/06-transcript/output/stage-report.md | Full | Current state |
| Layer 3 | workspace/_config/conventions.md | All | Naming/copy/spacing |

## Process

1. Branch `feature/v1-playback` from main; add the stage to PLAN.md and the
   routing table.
2. index.html: add a `#playback` video element (native controls, not muted,
   playsinline) beside the existing live `#preview` in the preview region.
3. main.ts: preview area becomes a three-state region — live (capture
   stream, muted), playback (recording blob via object URL, native
   controls), empty. Object URL is created on recording-complete and
   revoked when the recording is discarded or a new one starts (no leaks).
4. e2e: after stop, the playback element is visible with a blob source and
   a positive duration; discard hides it and re-arms the empty state.
5. `npm run test` + `npm run build` green; README updated.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Changes | index.html, src/main.ts, src/styles/base.css, tests/e2e | mixed |

## Audit

- [ ] Playback uses the recorded blob (not the live stream) and is audible (not muted)
- [ ] Object URL revoked on discard and on new recording start (no leak)
- [ ] No new dependencies; native controls only
- [ ] Live preview and playback never visible simultaneously
- [ ] Tests green; build green; README/PLAN updated

## Checkpoint

e2e playback assertions green; browser boot check; report; merge to main.
