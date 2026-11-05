# Stage 13 report — compact default and 30-minute cap

Date: 2026-11-06. Branch: `feature/v1-compact-cap`.

## Revisions applied (user request)

1. **Compact is the default quality**: `DEFAULT_QUALITY = 'compact'`
   (600 kbps video / 64 kbps audio). No UI exists for quality, per the
   earlier scope directive.
2. **30-minute recording cap**: the session's timer tick auto-stops the
   recording when elapsed time reaches `MAX_RECORDING_MS` (1,800,000 ms).
   Behavior mirrors a share-end: a notice ("Recording stopped at the
   30-minute limit."), a graceful finish, and the recording preserved and
   downloadable. At Compact the cap bounds a file to ~150 MB and memory to
   the same order.
3. **Copy trims**: the visible limit note is "Max recording: 30 minutes."
   and the discard hint is now "Reload (F5) to discard. You'll confirm
   first."

## Evidence

- `npm run test`: 51/51 (preset default flipped to compact in the table
  test; MAX_RECORDING_MS pinned to exactly 30 minutes).
- `npm run test:e2e`: 3/3. `npm run build`: clean.
- Note: the auto-stop path shares the already-covered
  `finishFromInterruption` machinery; a 30-minute wait is not testable in
  the suite, so the cap constant is unit-pinned and the path is documented
  here instead.

## Audit results

All four checklist items pass.
