# Stage 11 report — webcam overlay

Date: 2026-11-06. Branch: `feature/v1-webcam`.

## What exists

- `src/recorder/camera-source.ts` — getUserMedia wrapper (640x480 ideal,
  facingMode user) with full teardown.
- `src/recorder/canvas-compositor.ts` — composites the screen capture with
  a mirrored, rounded camera bubble (bottom-right, 22% of capture width,
  24 px margin) onto a canvas, and streams the canvas at 30 fps as the
  recorded video track. Key design: draws are driven by a Worker timer
  because requestAnimationFrame freezes in hidden tabs and hidden-page
  timers throttle to ~1 fps — a screen recorder lives hidden, so the
  recording must stay live while the user works elsewhere.
- Session: `includeCamera` option; camera requested inside the
  user-activation window (right after the mic); fail-soft (notice +
  recording continues); the composited stream is both the recorded track
  and the live preview; compositor + camera torn down on every path (user
  stop, share end, discard). Audio path and transcript mic-gating are
  untouched.
- UI: "Include camera" checkbox beside "Include microphone".

## Evidence

- `npm run test`: 50/50 (bubble geometry: aspect kept, margins, fallback).
  `npm run test:e2e`: 3/3 — the happy path's second recording enables the
  camera (Chromium fake device), exercising the compositor end-to-end and
  still producing a non-empty download.
- `npm run build`: clean; no new dependencies.

## Debugging record (vibe §6)

- First run failed everywhere with one root cause: the compositor `await`
  sat inside the synchronous `beginRecording` (TS1308), which broke the
  module parse and cascaded into vitest and all e2e. Fix: `beginRecording`
  became async; awaiting it is safe because nothing in it requires
  transient user activation.

## Audit results

All five checklist items pass.
