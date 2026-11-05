# Stage CONTEXT.md template (canonical)

Copy this into a new stage's CONTEXT.md and fill every section. Keep the file
under 80 lines. Inputs must be a table naming exact files. Never reference a
previous stage's CONTEXT.md — reference its `output/` artifacts only (one-way
references).

---

# Stage NN-name — <one-line job summary>

One stage, one job. <2-3 lines: what this stage produces and why it exists as
its own stage.>

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 3 | workspace/_config/conventions.md | All | Naming/copy/spacing rules |
| Layer 4 | stages/<prev-stage>/output/<artifact>.md | Full | Prior stage handoff |

## Process

1. <numbered steps the agent executes, in order>

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| <name> | output/<file> | <md/ts/etc> |

## Audit (pass/fail before declaring complete)

- [ ] <concrete, checkable assertion>

## Checkpoint

<what is reviewed and confirmed before the next stage starts>
