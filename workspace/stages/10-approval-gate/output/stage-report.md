# Stage 10 report — approval gate

Date: 2026-11-06. Branch: `feature/v1-approval-gate`.

## What exists

- **Approval ask (process rule):** after a merge to main, the agent asks the
  user to approve the current version. `approved/*` tags are never created
  without an explicit approval in the conversation.
- **The save:** on approval, the agent records the state in the new
  "Approved states" table in `workspace/CONTEXT.md`, commits that record,
  then creates an annotated tag `approved/vN` on it — so each tag contains
  its own receipt (date, commit, what was approved).
- **Recovery:** rolling forward (`git revert`) is preferred; rolling back
  (`git reset --hard approved/vN`) discards later commits and requires an
  explicit user instruction. The last approved tag is also the fallback
  state for vibe-code-rules §3/§6 repeated-failure resets.
- Docs-only stage: AGENTS.md, workspace/CONTEXT.md, PLAN.md. No app code
  touched, so the suites are unaffected (last known: 47/47 unit, 3/3 e2e).

## Audit results

All four checklist items pass.
