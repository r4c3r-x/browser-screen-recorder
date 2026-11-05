# Stage 12 report — finish flow revision

Date: 2026-11-06. Branch: `feature/v1-finish-flow`.

## Revisions applied (user request)

1. "Hide the 2 buttons at the beginning": Download recording is hidden
   (not disabled) until a finished recording is ready.
2. "Remove the Discard recording button": gone from markup, wiring, and
   handler.
3. Discard is now a **reload**: after a recording finishes, a hint appears
   ("To discard this recording, reload the page or press F5. You will be
   asked to confirm."), and the beforeunload guard extends to
   finished-with-result — the browser's own confirm dialog asks before the
   page reloads/discards.

## Behavioral notes

- Without a discard button, starting a new recording is the other reset
  path: the capture-started handler invalidates the previous recording's
  leftovers (transcript cancel, segment clear) that discard used to clean.
- The beforeunload warning now covers three states: recording, paused, and
  finished-with-unsaved-recording. A bare idle page reloads freely.

## Evidence

- e2e happy path restructured: idle asserts (status hidden, download
  hidden, discard count 0, hint hidden) → record → finish asserts (download
  visible+enabled, hint visible) → download → transcribe hidden (no mic) →
  record with mic+camera → transcribe visible → model-loading status →
  playback assertions → reload fires the beforeunload dialog (flag
  verified) → after reload, idle again (download hidden, hint hidden).
- `npm run test`: 50/50. `npm run test:e2e`: 3/3. `npm run build`: clean.

## Debugging record (vibe §6)

- One test-code fix: `expect(x).toBeTrue()` is jest syntax, not Playwright
  (`toBe(true)`). Exact error: "TypeError: expect(...).toBeTrue is not a
  function".

## Audit results

All five checklist items pass.
