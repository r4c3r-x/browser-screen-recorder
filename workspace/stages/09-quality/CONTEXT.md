# Stage 09 — fixed Balanced bitrate (revision 2)

One stage, one job: cap recording bitrates at the Balanced preset
(1.5 Mbps video / 96 kbps audio) so 2-minute files stop costing ~120 MB.
Revision note: the first draft added a user-facing quality selector — that
was not requested and was reverted. User directive: "just stay with the
Balanced quality." No UI, no options: the cap is a constant applied to
every recording. MediaRecorder natively accepts the bitrate options; no
re-encoding, no dependencies.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | PLAN.md | All | Scope context |
| Layer 3 | docs/api/mediarecorder.md | Constructor | Bitrate options |
| Layer 3 | workspace/_config/conventions.md | All | Naming/copy |

## Process

1. Branch `feature/v1-quality`; add stage to PLAN/routing.
2. src/config.ts: QUALITY_PRESETS table (compact/balanced/crisp documented
   with 2-minute size math); DEFAULT_QUALITY = 'balanced'.
3. media-recorder.ts: startRecorder takes bitrates and passes
   videoBitsPerSecond/audioBitsPerSecond on both constructor paths.
4. recording-session.ts: beginRecording applies the Balanced preset to
   every recording. No quality option in StartRecordingOptions, no UI.
5. Governance (user-directed): AGENTS.md and workspace/CONTEXT.md gain a
   binding scope rule — implement only explicit requests; questions are
   answered, not built.
6. Unit: preset table shape/values. Suites green; report; merge.

## Audit

- [ ] Bitrate options reach the MediaRecorder constructor on both mime paths
- [ ] No quality UI anywhere; no quality option in the start API
- [ ] Scope rule present in AGENTS.md and workspace/CONTEXT.md
- [ ] Unit + e2e green; PLAN decisions updated

## Checkpoint

Suites green; report; merge to main.
