# Stage 15 — upfront support check

One stage, one job: detect at page load whether the browser can capture the
screen at all, and fail honestly before the user clicks anything. User
request: reported "navigator.mediaDevices.getDisplayMedia is not a
function" on an Android phone (Messenger in-app browser) and approved the
proposed "upfront-support-check": Start disabled, checkboxes disabled, and
a clear message instead of a post-click error banner.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/14-drive-share (removed) | — | No dependency |
| Layer 3 | docs/api/mediadevices-getdisplaymedia.md | Browser compat | Mobile = no support |

## Process

1. Branch `feature/v1-support-check`; add stage to PLAN/routing.
2. capture-source.ts: `isScreenCaptureSupported()` — pure presence check
   for navigator.mediaDevices.getDisplayMedia (unit-tested with stubs).
3. controls.ts: `setUnsupported()` — when unsupported, update() disables
   Start and both checkboxes and hides save controls regardless of state.
4. main.ts: at boot, if unsupported -> banner with actionable copy ("Use
   Chrome or Edge on a desktop computer") + setUnsupported(true).
5. e2e: context with mediaDevices undefined -> Start disabled, alert
   visible, checkboxes disabled. Unit: supported/unsupported/absent.
6. README requirements one-liner (phones/tablets unsupported). Suites
   green; report; merge; push (auto-deploy).

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Changes | src/recorder/capture-source.ts, src/ui/controls.ts, src/main.ts | ts |

## Audit

- [ ] Unsupported browser: Start + checkboxes disabled, banner explains before any click
- [ ] Supported browser: behavior byte-identical to approved/v5
- [ ] Unit + e2e green; tsc clean; README/PLAN updated

## Checkpoint

Suites green; report; merge; deploy; approval ask for approved/v6.
