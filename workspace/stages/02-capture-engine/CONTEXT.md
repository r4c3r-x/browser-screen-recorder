# Stage 02 — capture engine

One stage, one job: the recorder core with no UI. Display capture, recorder
wrapper, and the pure logic (mime negotiation, elapsed-time math, filename
building) with unit tests. No AudioContext yet (stage 03), no DOM code
(stage 04).

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/01-foundation/output/stage-report.md | Full | Foundation state |
| Layer 3 | docs/api/mediadevices-getdisplaymedia.md | API + browser compat | Capture behavior |
| Layer 3 | docs/api/mediarecorder.md | API + browser compat | Recorder behavior |
| Layer 3 | workspace/_config/conventions.md | All | Naming, canonical constants |

## Process

1. src/types.ts: RecordingState, CaptureOptions, RecordingResult, session
   event types.
2. src/config.ts: canonical constants — mime preference list, filename
   prefix, recorder timeslice, port.
3. src/recorder/capture-source.ts: getDisplayMedia wrapper; video-track
   ended detection; teardown that stops every track.
4. src/recorder/media-recorder.ts: mime negotiation (isTypeSupported
   injected for testability), chunk collection, size tracking, pause/resume,
   stop producing a Blob.
5. src/recorder/elapsed-time.ts: pause-aware elapsed math (pure).
6. src/recorder/filename.ts: timestamped filename builder (pure).
7. tests/unit for negotiation, elapsed math, filename builder.
8. Add vitest as devDep; `npm run test` passes; `tsc --noEmit` clean.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Modules | src/types.ts, src/config.ts, src/recorder/* | ts |
| Tests | tests/unit/*.test.ts | ts |

## Audit

- [ ] tsc --noEmit clean; no `any` anywhere
- [ ] Unit tests pass and cover failure paths (no supported mime, empty chunks)
- [ ] No DOM access anywhere in src/recorder (stage boundary held)
- [ ] Files < 300 lines, functions < 50 lines

## Checkpoint

Unit tests and build green; report written; then stage 03.
