# Stage 12 — finish flow revision

One stage, one job: remove the manual discard button and make "reload" the
discard path, with a browser confirm before it. User request (verbatim,
condensed): "hide the 2 buttons at the beginning" (Download recording /
Discard recording); "Remove the Discard recording button"; "After recording,
make a text appear telling the user to reload the browser or press F5 to
discard recording, but before it reloads, the user will be ask if his sure."

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/11-webcam-overlay/output/stage-report.md | Full | Current state |
| Layer 3 | workspace/_config/conventions.md | All | Copy rules |

## Process

1. Branch `feature/v1-finish-flow`; add stage to PLAN/routing.
2. index.html: remove the Discard button; add a finish hint paragraph
   ("To discard this recording, reload the page or press F5. You will be
   asked to confirm.").
3. controls.ts: Download recording hidden unless a finished recording is
   ready (was visible-but-disabled); discard wiring removed.
4. main.ts: hint visible only when finished with a result; the
   beforeunload confirm extends to finished-with-result (reloading with an
   unsaved recording asks "are you sure"); starting a new recording
   invalidates the previous one's leftovers (transcript cancel + segment
   clear) since discard no longer exists.
5. e2e: idle asserts (download hidden, discard gone), finish assertions
   (download + hint visible), and a reload fires the beforeunload dialog.
6. Suites green; report; merge; push (auto-deploy); approval ask.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Changes | index.html, src/main.ts, src/ui/controls.ts, tests/e2e | mixed |

## Audit

- [ ] No Discard button anywhere; Download hidden until ready
- [ ] Hint text only in finished-with-result state
- [ ] Reload with unsaved recording triggers the browser confirm
- [ ] New-recording cleanup replaces discard cleanup (no stale transcript/URL)
- [ ] Unit + e2e green; tsc clean; README/PLAN updated

## Checkpoint

Suites green; report; merge; deploy; approval ask for approved/v3.
