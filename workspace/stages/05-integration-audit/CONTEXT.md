# Stage 05 — integration audit

One stage, one job: prove v1 works end-to-end and close out. e2e test,
failure-path matrix, docs finalization, merge to main.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/04-ui-shell/output/stage-report.md | Full | UI behavior and known gaps |
| Layer 4 | PLAN.md | All | Definition of done |

## Process

1. Add @playwright/test (chromium only); config starts the vite dev server
   on 5173.
2. e2e: launch with fake media streams and auto-selected capture source;
   record -> pause -> resume -> stop; assert the download fires, the blob is
   non-empty, and timer/size UI behaved.
3. Manual failure matrix: deny permission; stop sharing from the browser UI;
   unsupported-mime path; mic deny. Record results in the audit report.
4. Finalize README.md (setup/run/test/deploy), PLAN.md checkboxes, and
   AGENTS.md if architecture shifted during the build.
5. Merge feature/v1-core-recorder to main locally (--no-ff).

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Audit report | output/stage-report.md | md |
| e2e | tests/e2e/*.spec.ts, playwright.config.ts | ts |
| Docs | README.md, PLAN.md updates | md |

## Audit

- [ ] `npm run test` and `npm run test:e2e` both green
- [ ] `npm run build && npm run preview` serves a working app
- [ ] README covers setup, run, test, deploy; no placeholder text
- [ ] Deferred items documented in PLAN.md
- [ ] main merged; feature branch retained

## Checkpoint

Final report to the user: how to run, what was verified, what remains manual.
