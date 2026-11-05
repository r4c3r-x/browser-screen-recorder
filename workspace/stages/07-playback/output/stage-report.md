# Stage 07 report — playback

Date: 2026-11-06. Branch: `feature/v1-playback`.

## What exists

- Three-state preview area in main.ts: live capture (muted, during
  recording) / playback (finished recording via object URL, native video
  controls, audible) / empty hint. Exactly one visible at a time.
- `#playback` video element with native `controls` — no player library
  (play/seek/volume are platform features; a custom player would be scope
  creep per vibe §10).
- Object URL lifecycle: created on recording-complete, revoked on discard
  and on the next recording's start (checked in showPreviewArea's
  non-playback branches); `removeAttribute('src') + load()` resets the
  element.

## Evidence

- e2e happy path now asserts: playback visible after stop, `src` is a
  `blob:` URL, `duration > 0`, live preview hidden, and after discard the
  player hides again. 3/3 e2e pass; 45/45 unit; build clean.

## Debugging record (vibe §6)

- The new "live preview is hidden after stop" assertion exposed a latent
  CSS bug: `.preview-video { display: block }` overrode the UA stylesheet's
  `[hidden]` rule (author CSS beats UA CSS regardless of specificity), so
  "hidden" videos kept rendering as empty blocks. This explains the dark
  box visible in the stage 04 boot screenshot. Fix: global
  `[hidden] { display: none !important; }`. One rule; no JS changes.

## Audit results

All five checklist items pass (blob-based audible playback, URL revocation,
no new dependencies, mutual exclusivity, tests/build/docs green).
