# Stage 04 report — UI shell

Date: 2026-11-06. Branch: `feature/v1-core-recorder`.

## What exists

- `index.html` — semantic regions: banner, preview, status, controls, with
  aria-labels and a live region for messages.
- `src/ui/controls.ts` — button visibility/enabled state derived strictly
  from session state (no ad-hoc booleans); start button doubles as the
  loading state ("Waiting for permission…" + aria-busy) during capture
  permission; mic checkbox disabled outside idle/finished.
- `src/ui/status-panel.ts` — state chip (Idle/Waiting/Recording/Paused/
  Finished), pause-aware timer, live size, mime badge.
- `src/ui/format.ts` — pure formatters: formatElapsed (m:ss / h:mm:ss),
  formatBytes (binary units), formatMimeLabel. Unit-tested (8 tests).
- `src/ui/error-banner.ts` — single dismissible message region; errors
  (role=alert) vs notices (role=status); new message replaces stale ones.
- `src/main.ts` — composition root; error-code → actionable copy mapping
  (aborted becomes a notice); preview attach/detach; download with
  timestamped filename; beforeunload guard while recording/paused.
- `src/styles/base.css` — spacing only from the 4/8/12/16/24/32/48 scale,
  one system font stack, neutral palette with red/green accents, contrast
  >= 4.5:1 for text.
- Session additions needed by the UI: `capture-started` event (stream +
  mime for preview/badge) and `recording-complete` event (blob reaches the
  UI on both user-stop and share-ended paths — without it, a recording
  finished by the browser's stop-sharing control would be lost).
- `src/recorder/filename.ts` gained extensionFromMime.
- `src/vite-env.d.ts` added (vite/client types for the CSS import; stage 01
  missed it — tsc flagged TS2882).

## Evidence

- `npm run test`: 32/32 pass. `npm run build`: exits 0.
- Dev server boot verified in a real browser (in-app browser): DOM snapshot
  shows all regions, correct initial states (Start enabled, Download/
  Discard disabled, Pause/Resume/Stop hidden), and a screenshot confirms
  layout/spacing/contrast. No console errors on boot.

## Notes and deviations

- **Verified here:** boot rendering and initial states. **Not verifiable
  without human hands:** the real permission prompt flow and mid-recording
  browser interactions. Those are covered by the stage 05 e2e (Chromium
  fake-media flags) plus a manual matrix for the user.
- Failure-path copy lives in one map in main.ts; unknown errors append the
  raw browser message so nothing is silently swallowed.

## Audit results

All four checklist items pass (loading state, error states, copy/emoji
check, spacing scale, state-derived control logic).
