# Stage 03 — audio mixing

One stage, one job: combine system audio (from the display capture) with an
optional microphone into one audio track, and wire capture plus recorder into
a RecordingSession state machine. Still no DOM code.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/02-capture-engine/output/stage-report.md | Full | Recorder core API |
| Layer 3 | docs/api/audiocontext.md | API | Mixing graph |
| Layer 3 | docs/api/mediastreamtrack.md | API | Track lifecycle |
| Layer 3 | workspace/_config/conventions.md | All | Naming |

## Process

1. src/recorder/audio-mixer.ts: AudioContext graph — system audio source and
   optional mic source into gain nodes, into a MediaStreamAudioDestination;
   returns the mixed MediaStream; close() tears the context down.
2. src/recorder/recording-session.ts: facade/state machine idle -> requesting
   -> recording <-> paused -> finished; emits state, elapsed, and size
   events; handles share-ended (graceful finish, recording preserved);
   fail-soft mic (getUserMedia failure means record without mic and report
   a notice, never fail the session).
3. Unit tests for the pure decision logic (e.g., mixing decision given
   available tracks; state transition validity).
4. `npm run test` and `npm run build` green.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Modules | src/recorder/audio-mixer.ts, src/recorder/recording-session.ts | ts |
| Tests | tests/unit/*.test.ts | ts |

## Audit

- [ ] AudioContext is closed on every teardown path (including share-ended)
- [ ] Mic failure never fails the session
- [ ] State transitions are explicit; no dead or unreachable states
- [ ] src/recorder still has zero DOM access

## Checkpoint

Tests green; report written; then stage 04.
