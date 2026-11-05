# Stage 10 — approval gate

One stage, one job: make "save an approved state" part of the ICM loop.
User request (verbatim): "can you also update the ICM so that you will ask
me to approve the current version and save that as the last state to which
it can be update again".

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | PLAN.md | All | Scope context |
| Layer 3 | workspace/CONTEXT.md | Rules | Where the process lives |

## Process

1. Branch `feature/v1-approval-gate`; add stage to PLAN/routing.
2. AGENTS.md: new section "Approval and recovery checkpoints" — after a
   merge, ask the user to approve; on an explicit yes, create annotated tag
   `approved/vN` (N increments) on the recorded state, then commit the
   routing-table record; restoring prefers rolling forward (revert), rolling
   back (`git reset --hard approved/vN`) only on explicit user instruction.
3. workspace/CONTEXT.md: "Approved states" table (tag / date / commit /
   user-approved contents) + rule: never tag without an explicit approval.
4. PLAN decision entry; suites still green (docs-only stage); report; merge.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Governance | AGENTS.md, workspace/CONTEXT.md, PLAN.md | md |

## Audit

- [ ] The agent asks for approval; tagging never happens unprompted
- [ ] approved/vN tags are annotated and recorded in the routing table
- [ ] Restore procedure documented, destructive path gated on explicit user instruction
- [ ] PLAN/routing updated; report written

## Checkpoint

Governance merged; the agent then asks the user to approve the current
version — the first approved/v1 tag happens only after that reply.
