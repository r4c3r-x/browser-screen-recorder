# Workspace CONTEXT — routing table (ICM Layer 1)

You are in the build workspace for the browser screen recorder. Read AGENTS.md
first (Layer 0). This file routes you to one stage at a time. Load only one
stage contract at once.

## Routing

| Stage | Name | Status | Contract | Latest report |
|---|---|---|---|---|
| 01 | foundation | complete | stages/01-foundation/CONTEXT.md | stages/01-foundation/output/stage-report.md |
| 02 | capture-engine | complete | stages/02-capture-engine/CONTEXT.md | stages/02-capture-engine/output/stage-report.md |
| 03 | audio-mixing | complete | stages/03-audio-mixing/CONTEXT.md | stages/03-audio-mixing/output/stage-report.md |
| 04 | ui-shell | complete | stages/04-ui-shell/CONTEXT.md | stages/04-ui-shell/output/stage-report.md |
| 05 | integration-audit | complete | stages/05-integration-audit/CONTEXT.md | stages/05-integration-audit/output/stage-report.md |
| 06 | transcript | complete | stages/06-transcript/CONTEXT.md | stages/06-transcript/output/stage-report.md |
| 07 | playback | complete | stages/07-playback/CONTEXT.md | stages/07-playback/output/stage-report.md |
| 08 | ui-revisions | complete | stages/08-ui-revisions/CONTEXT.md | stages/08-ui-revisions/output/stage-report.md |
| 09 | quality | complete | stages/09-quality/CONTEXT.md | stages/09-quality/output/stage-report.md |
| 10 | approval-gate | complete | stages/10-approval-gate/CONTEXT.md | stages/10-approval-gate/output/stage-report.md |
| 11 | webcam-overlay | complete | stages/11-webcam-overlay/CONTEXT.md | stages/11-webcam-overlay/output/stage-report.md |
| 12 | finish-flow | complete | stages/12-finish-flow/CONTEXT.md | stages/12-finish-flow/output/stage-report.md |
| 13 | compact-cap | complete | stages/13-compact-cap/CONTEXT.md | stages/13-compact-cap/output/stage-report.md |

## How to execute a stage

1. Read the stage's CONTEXT.md (Layer 2). Load only the inputs it lists from
   Layers 3–4. Typical total context: 2–8k tokens.
2. Execute the Process steps in order. Write outputs to the stage's `output/`
   directory.
3. Run the Audit checklist. If any item fails, fix it before continuing.
4. Update this routing table's Status (pending → in-progress → complete).
5. Commit (`type: short description`), then checkpoint before the next stage.

## Approved states

The last state the user explicitly approved. Recovery procedure and tagging
rules: see the "Approval and recovery checkpoints" section in AGENTS.md.
Never tag without an explicit approval in the conversation.

| Tag | Date | Commit | Approved contents |
|---|---|---|---|
| approved/v1 | 2026-11-06 | f3b5f9e | v1 feature set: screen/window/tab recording with mic + system audio, pause/resume, in-app playback, offline Vosk transcription to .srt/.txt (mic-gated), fixed Balanced bitrate (1.5 Mbps video / 96 kbps audio), minimal centered UI, nothing uploaded. Verified: 47/47 unit, 3/3 e2e, clean build. Stages 01-10 complete |
| approved/v2 | 2026-11-06 | 334cbcd | Identical app to v1 (no app-code changes) plus deployment: GitHub Pages hosting at https://r4c3r-x.github.io/browser-screen-recorder/ with Actions auto-deploy on push to main, remote origin configured, docs updated. Verified live: page, bundle, and vosk chunk all serve 200 |
| approved/v3 | 2026-11-06 | 2024f39 | v2 plus webcam overlay (camera bubble composited into the recording, fail-soft, Worker-driven draws) and the revised finish flow: no discard button, download hidden until a recording is ready, discarding = reload with a browser confirm. Verified: 50/50 unit, 3/3 e2e, clean build, live site auto-deployed |
| approved/v4 | 2026-11-06 | cf11377 | v3 plus Compact (600k/64k) as the default quality and a 30-minute recording cap with auto-stop (notice + graceful finish). Visible copy trimmed to two short lines. Verified: 51/51 unit, 3/3 e2e, clean build, live site auto-deployed |

## Rules

- **Nothing is implemented until the user explicitly asks for it.** Questions
  are answered, not built. Proposals are made in one sentence and wait for a
  yes. Every stage contract must quote the user's request that justifies it.
- Stages communicate via markdown files only; the `output/` of stage N is the
  input of stage N+1. Humans may edit any output file between stages — the
  next stage picks up the edited version.
- One-way references; each fact has one canonical home (see
  `_config/conventions.md`).
- The status of the whole project is this file: keep it truthful.
