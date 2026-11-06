# Stage 15 report — upfront support check

Date: 2026-11-07. Branch: `feature/v1-support-check`.

## What exists

- `isScreenCaptureSupported()` in capture-source.ts: pure presence check
  for `navigator.mediaDevices.getDisplayMedia`. Mobile and in-app browsers
  do not implement screen capture; the app now says so at page load.
- Boot check in main.ts: on an unsupported browser the banner shows
  "Screen recording isn't supported in this browser. Use Chrome or Edge on
  a desktop computer." and `controls.setUnsupported(true)` locks the UI:
  Start disabled (visible, labeled normally — not a loading state), both
  checkboxes disabled, save controls hidden. No click-to-discover failure.
- README requirements note that phones/tablets cannot record.

## Evidence

- `npm run test`: 55/55 (4 new unit cases: present, absent from
  mediaDevices, mediaDevices missing, navigator absent — via stubbed
  globals).
- `npm run test:e2e`: 4/4 — new test removes getDisplayMedia from
  MediaDevices.prototype and asserts Start/checkboxes disabled plus the
  alert, before any click.
- `npm run build`: clean.

## Debugging record (vibe §6)

- First e2e stub shadowed the property on the mediaDevices instance and did
  not take effect (getDisplayMedia lives on MediaDevices.prototype);
  re-stubbed on the prototype. Also caught a leftover `refreshShareControls`
  reference from the reverted share feature via tsc — removed.

## Audit results

All three checklist items pass (unsupported locks upfront with copy;
supported path unchanged — the happy-path e2e is byte-for-byte the v5 flow;
suites green, docs updated).
