# Stage 09 report — fixed Balanced bitrate

Date: 2026-11-06. Branch: `feature/v1-quality`.

## What exists

- Every recording is now capped at the Balanced preset: 1.5 Mbps video /
  96 kbps audio, applied via `videoBitsPerSecond` / `audioBitsPerSecond` on
  both MediaRecorder constructor paths (preferred and fallback mime).
  Expected size: ~24 MB per busy 2-minute recording versus ~120 MB
  unconstrained (Chrome's default target of up to ~8 Mbps); static screen
  content encodes well below the cap.
- `src/config.ts` keeps the preset table (compact/balanced/crisp with the
  2-minute math) as documented configuration; `DEFAULT_QUALITY = 'balanced'`
  is what the session applies. No quality UI exists and the start API takes
  only `includeMic`.

## Revision record

The first draft of this stage added a user-facing quality selector. The
user rejected it: it was never requested ("is it possible to reduce…" was a
question, not a build order). The selector was removed the same session and
the user's directive — "just stay with the Balanced quality" — is the
shipped behavior. Per that directive, the ICM structure itself was updated
so this cannot recur:

- `AGENTS.md` gains a binding **Scope discipline** section: questions are
  answered, not built; no UI/options beyond explicit requests; proposals
  are one sentence and wait; every stage contract must quote the user's
  request.
- `workspace/CONTEXT.md` Rules now open with the same constraint.

## Evidence

- `npm run test`: 47/47 (preset table shape, ordering, default).
  `npm run test:e2e`: 3/3 (recordings flow through the Balanced cap).
  `npm run build`: clean; main bundle unchanged (18 KB class).

## Audit results

All four checklist items pass.
