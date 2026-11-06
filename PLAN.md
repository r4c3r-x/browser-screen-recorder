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
- [x] 02-capture-engine — display capture + MediaRecorder core, pure logic + unit tests
- [x] 03-audio-mixing — mic + system audio mixing, session state machine, fail-soft mic
- [x] 04-ui-shell — controls, status panel, error banner, live preview, styles
- [x] 05-integration-audit — e2e test, failure-path matrix, docs finalization, merge to main
- [x] 06-transcript — offline (Vosk/Kaldi, in-browser) transcription, .srt + .txt downloads
- [x] 07-playback — in-app playback of the finished recording (native controls)
- [x] 08-ui-revisions — transcribe gated to mic recordings, text removals, centered heading
- [x] 09-quality — fixed Balanced bitrate cap (1.5 Mbps video / 96 kbps audio), no UI
- [x] 10-approval-gate — user-approved states saved as approved/vN tags, restore procedure
- [x] 11-webcam-overlay — camera bubble composited over the capture (fail-soft, Worker-driven draws)
- [x] 12-finish-flow — no discard button; download hidden until ready; reload (with confirm) is the discard path
- [x] 13-compact-cap — Compact (600k/64k) is the default; recordings auto-stop at 30 minutes
- [x] 14-drive-share — REMOVED at user direction (OAuth client ID setup rejected); see stages/14-drive-share/
- [x] 15-support-check — upfront check: unsupported browsers (phones, in-app) show a message and locked controls at load

## Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-11-06 | Vanilla TS + Vite, zero runtime deps | User-confirmed. Lightest output, type safety, no framework lifecycle around mutable stream code |
| 2026-11-06 | v1 includes audio mixing | Stated requirement of the user |
| 2026-11-06 | Library + webcam overlay deferred | Phase-2 candidates; cheapest time to cut scope is before code exists |
| 2026-11-06 | Local-only git | No remote exists; vibe §3 push rule documented as deviation until one is added |
| 2026-11-06 | Chromium-only e2e automation | getDisplayMedia is flag-automatable in Chromium; Firefox/Safari covered by manual matrix |
| 2026-11-06 | Transcript engine: Vosk (Kaldi) offline, in-browser | Final user directive: "free only, no AI services". Vosk via vosk-browser WASM is keyless, accountless, fully offline (classic statistical ASR, not a neural model). Supersedes the earlier online BYOK design; the online engine was removed. Model: 41 MB small US-English from a CORS-verified mirror, cached after first use |
| 2026-11-06 | Fixed Balanced bitrate cap (1.5 Mbps video / 96 kbps audio) on all recordings | User asked about 2-minute file sizes and accepted the Balanced tradeoff (~24 MB per 2 busy minutes vs ~120 MB unconstrained). A quality selector built alongside was rejected as unrequested scope and removed; the ICM workspace now carries a binding scope rule (AGENTS.md, workspace/CONTEXT.md): questions are answered, not built |
| 2026-11-06 | Hosted on GitHub Pages (public repo r4c3r-x/browser-screen-recorder) | User chose GitHub Pages over Firebase/ZCode Sites. Auto-deploy via Actions on push to main (base /browser-screen-recorder/); legacy gh-pages branch route errored opaquely and was replaced by the workflow build. Resolves the vibe §3 no-remote deviation: origin exists and receives every commit |
| 2026-11-06 | Compact (600k/64k) is the default quality; recordings cap at 30 minutes | User compared the Compact preview against Balanced and chose Compact; a 30-minute auto-stop bounds memory (~150 MB max file). Approved states v1-v3 used Balanced without a cap |

## Failure paths that must ship in v1

- Permission denied → visible banner with recovery hint
- Sharing stopped from the browser UI → session finishes gracefully, recording kept
- Mic denied → fail-soft: record without mic, show notice
- No supported mime type → visible unsupported-browser message
- Navigation/close during recording → beforeunload warning

## Deferred (not in v1)

- Recordings library (IndexedDB storage, in-app playback, rename, delete) —
  in-app playback shipped in stage 07; full library still deferred
- ~~Webcam overlay (canvas compositing)~~ — shipped in stage 11
- Git remote, CI, deployment — shipped in stage 10/11 era (GitHub Pages)

## Definition of done (vibe §12)

Feature works end-to-end; error and loading states exist; unit and e2e tests
pass; code committed; docs updated.
