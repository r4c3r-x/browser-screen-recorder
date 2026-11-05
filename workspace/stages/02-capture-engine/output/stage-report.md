# Stage 02 report — capture engine

Date: 2026-11-06. Branch: `feature/v1-core-recorder`.

## What exists

- `src/types.ts` — RecordingState, StartRecordingOptions, RecordingResult,
  RecordingFormat.
- `src/config.ts` — canonical constants: mime preference list (vp9/opus →
  vp8/opus → webm → mp4), 1000 ms timeslice, filename prefix, port 5173.
- `src/recorder/capture-source.ts` — getDisplayMedia wrapper with typed
  error classification (NotAllowedError → permission-denied, etc.), video
  track `ended` promise for browser-initiated share stop, and dispose() that
  stops every track.
- `src/recorder/media-recorder.ts` — pure `chooseRecordingFormat` with
  injected support predicate; `startRecorder` with chunk accumulation, live
  byte totals, guarded pause/resume, and a stop() that resolves with the
  complete blob (also when the recorder stopped on its own).
- `src/recorder/elapsed-time.ts` — pure pause-aware elapsed math.
- `src/recorder/filename.ts` — pure timestamped filename builder.
- `tests/unit/` — 15 tests across the three pure modules, including failure
  paths (no supported mime, empty format list, negative clamp, double pause).

## Evidence

- `npm run test`: 15/15 pass.
- `npm run build` (tsc --noEmit + vite build): exits 0.
- Audit greps: no `any`, no DOM access under src/recorder, largest file 153
  lines (< 300), all functions < 50 lines.

## Notes and deviations

- **TS 7 DOM lib removed `MediaRecorderErrorEvent`** (spec deprecated it):
  the error handler now reads `.error` structurally with a typed cast and
  falls back to a generic message. Exact compiler error was
  `TS2552: Cannot find name 'MediaRecorderErrorEvent'`.
- `createRecorder` falls back to the browser-default mime if construction
  with the negotiated mime throws despite `isTypeSupported` returning true.
- No deviations from the contract's Process list; no DOM code was added
  (stage boundary held).

## Audit results

All four checklist items pass.
