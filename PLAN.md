# PLAN.md — Build Plan (canonical scope source)

Per vibe-code-rules §2 this file is the plan of record: what is being built,
for whom, in what order. Update it when a decision changes; do not duplicate
its content elsewhere.

## What and who

A browser-based screen recording tool for desktop use: pick a screen, window,
or tab; optionally include mic and system audio; record with pause/resume;
download the result. Nothing is uploaded. Audience: the user themself, on
Chromium-first browsers.

## v1 scope (build order)

- [x] 01-foundation — tooling scaffold, ICM workspace, local API docs
- [ ] 02-capture-engine — display capture + MediaRecorder core, pure logic + unit tests
- [ ] 03-audio-mixing — mic + system audio mixing, session state machine, fail-soft mic
- [ ] 04-ui-shell — controls, status panel, error banner, live preview, styles
- [ ] 05-integration-audit — e2e test, failure-path matrix, docs finalization, merge to main

## Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-11-06 | Vanilla TS + Vite, zero runtime deps | User-confirmed. Lightest output, type safety, no framework lifecycle around mutable stream code |
| 2026-11-06 | v1 includes audio mixing | Stated requirement of the user |
| 2026-11-06 | Library + webcam overlay deferred | Phase-2 candidates; cheapest time to cut scope is before code exists |
| 2026-11-06 | Local-only git | No remote exists; vibe §3 push rule documented as deviation until one is added |
| 2026-11-06 | Chromium-only e2e automation | getDisplayMedia is flag-automatable in Chromium; Firefox/Safari covered by manual matrix |

## Failure paths that must ship in v1

- Permission denied → visible banner with recovery hint
- Sharing stopped from the browser UI → session finishes gracefully, recording kept
- Mic denied → fail-soft: record without mic, show notice
- No supported mime type → visible unsupported-browser message
- Navigation/close during recording → beforeunload warning

## Deferred (not in v1)

- Recordings library (IndexedDB storage, in-app playback, rename, delete)
- Webcam overlay (canvas compositing)
- Git remote, CI, deployment (the `vite build` output is static; host anywhere)

## Definition of done (vibe §12)

Feature works end-to-end; error and loading states exist; unit and e2e tests
pass; code committed; docs updated.
