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

## How to execute a stage

1. Read the stage's CONTEXT.md (Layer 2). Load only the inputs it lists from
   Layers 3–4. Typical total context: 2–8k tokens.
2. Execute the Process steps in order. Write outputs to the stage's `output/`
   directory.
3. Run the Audit checklist. If any item fails, fix it before continuing.
4. Update this routing table's Status (pending → in-progress → complete).
5. Commit (`type: short description`), then checkpoint before the next stage.

## Rules

- Stages communicate via markdown files only; the `output/` of stage N is the
  input of stage N+1. Humans may edit any output file between stages — the
  next stage picks up the edited version.
- One-way references; each fact has one canonical home (see
  `_config/conventions.md`).
- The status of the whole project is this file: keep it truthful.
