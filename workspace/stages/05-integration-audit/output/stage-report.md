# Stage 05 report — integration audit

Date: 2026-11-06. Branch: `feature/v1-core-recorder`.

## What exists

- `playwright.config.ts` — chromium-only; webServer starts `npm run dev` on
  the configured port; fake media + auto-selected capture source flags.
- `tests/e2e/recorder.spec.ts` — 3 tests:
  1. Happy path: start → Recording chip → preview visible → mime badge →
     timer ticks → pause freezes timer → resume → size accumulates → stop →
     Finished → explicit Download → non-empty file with
     `screen-recording-YYYYMMDD-HHmmss.webm` name → Discard re-locks save.
  2. Permission denied (getDisplayMedia rejects NotAllowedError): error
     banner with recovery copy, session returns to idle, banner dismisses.
  3. Mic denied: fail-soft — recording continues without mic, visible
     notice, download still works.
- Docs finalized: PLAN.md all stages checked; README status/test/deploy
  sections completed.

## Evidence

- `npm run test:e2e`: 3/3 pass in ~15 s.
- `npm run test`: 32/32 pass. `npm run build`: exits 0;
  `npm run preview`: HTTP 200 on the production bundle.
- Refactor scan (vibe §12): largest file 263 lines (< 300); no `any`;
  no duplicated logic (mixing strategy, transitions, and formatters each
  have one canonical home).

## Incident during e2e (for the record)

The first e2e run failed 2/3 at the download step. Exact error:
`TimeoutError: page.waitForEvent: Timeout 20000ms exceeded while waiting for
event "download"`. Hypothesis-check showed the app was correct: the tests
waited for a download after clicking Stop, but the design uses an explicit
Download recording button. Tests were fixed to click it; no app code
changed. All earlier assertions in the failing tests (record, timer,
pause-freeze, size, fail-soft notice) had already passed.

## Automated vs. manual verification

**Automated (verified):** happy path incl. pause-aware timer and blob
output; permission-denied recovery; mic-denied fail-soft; unit-level logic
(mime negotiation, elapsed math, filenames, transitions, formatting).

**Manual (cannot be automated here — user should click through once):**
- Deny the real browser permission prompt (uses the OS picker).
- Press the browser's own "Stop sharing" bar mid-recording: recording must
  finish gracefully and stay downloadable (the `recording-complete` path).
- Firefox: recording works, system audio unavailable (single-source
  passthrough design means no AudioContext is used at all in this case).
- Safari: expect MP4 output via the mp4 fallback entry.

## Audit results

All five checklist items pass (e2e green, build+preview green, README
complete with no placeholder text, deferred items in PLAN.md, merge to main
performed).
