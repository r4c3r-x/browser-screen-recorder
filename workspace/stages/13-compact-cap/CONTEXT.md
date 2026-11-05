# Stage 13 — compact default and 30-minute cap

One stage, one job: make the Compact preset the permanent default and cap
recordings at 30 minutes. User request (verbatim): "let's use the compact
version and make that the approved one"; "limit the recording to 30
minutes. add a description somewhere that max minutes is 30 minutes. use
your own words make it as short as possible"; and shorten the discard hint
"as short and minimal as possible".

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | PLAN.md | Decisions log | Compact preview comparison |
| Layer 3 | workspace/_config/conventions.md | All | Copy rules |

## Process

1. Branch `feature/v1-compact-cap`; add stage to PLAN/routing.
2. src/config.ts: DEFAULT_QUALITY = 'compact'; add MAX_RECORDING_MS
   (1_800_000) — 30 min at Compact is ~150 MB.
3. recording-session.ts: the elapsed-timer tick auto-stops at the cap —
   notice ("Recording stopped at the 30-minute limit."), graceful finish,
   recording preserved like a share-end.
4. index.html: one short visible line, "Max recording: 30 minutes."; the
   discard hint shortened to "Reload (F5) to discard. You'll confirm first."
5. Unit: constant value. e2e unchanged (30 min is not testable in-suite;
   auto-stop shares the covered share-end finish path).
6. README one-liner; suites green; report; merge; push (auto-deploy).

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Changes | src/config.ts, src/recorder/recording-session.ts, index.html | mixed |

## Audit

- [ ] Compact (600k/64k) is the default; no UI added
- [ ] Auto-stop fires at the cap, emits one notice, preserves the recording
- [ ] Visible copy is the two short lines only
- [ ] Unit + e2e green; tsc clean; README/PLAN updated

## Checkpoint

Suites green; merge; deploy; approval ask for approved/v4.
