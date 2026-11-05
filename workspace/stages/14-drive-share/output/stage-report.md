# Stage 14 report — share to Google Drive

Date: 2026-11-06. Branch: `feature/v1-drive-share`.

## What exists

- **Share recording** button (finished state only). Flow: click → if no
  OAuth client ID is stored, a setup field appears beside the title form;
  sign-in opens (Google Identity Services, scope `drive.file`); a title
  form appears (title + "Also store the transcript" checkbox, enabled only
  when a transcript exists) → **Upload to Google Drive** uploads the
  recording, makes it publicly viewable, and shows the Drive link. The
  transcript (optional, same title, .txt) uploads privately.
- **Signed-out-on-reload by design**: the access token lives in memory
  only — never localStorage — so reloading logs the user out. The OAuth
  client ID (public identifier, per-user config) persists in localStorage.
- Upload runs under the beforeunload guard (closing mid-upload warns).
- Errors mapped: closed prompt (silent return to form), 401/403 with
  actionable copy, generic HTTP.
- No new npm dependencies: GIS loads from Google at runtime; Drive REST via
  fetch. Multipart upload with `uploadType=multipart`.

## Evidence

- `npm run test`: 56/56 (title sanitation incl. illegal characters,
  fallback name, Drive link builder).
- `npm run test:e2e`: 3/3 — share button visibility, setup-then-form flow
  with a well-formed client ID, title-gated upload button, transcript
  checkbox state (visible but disabled while the lazy model loads), cancel
  back to Share.
- `npm run build`: clean; bundle unchanged materially.

## Debugging record (vibe §6)

- Three real defects caught by the new e2e assertions, each fixed:
  1. Dead code in share-controls (declared-but-unimplemented
     `setClientIdField`) — tsc TS6133/TS2552.
  2. State-machine flaw: the setup/title phase was unreachable without a
     client ID because sign-in ran first; reworked so Share shows setup +
     form, and sign-in runs on Upload.
  3. Upload button never re-enabled: nothing listened to the title input
     (update only ran on state changes); added an input listener.

## Manual verification remaining (user)

Real upload requires the user's OAuth client ID (console.cloud.google.com:
create an OAuth client ID for a web application with origins
https://r4c3r-x.github.io and http://localhost:5173, paste into the app's
setup field). First sign-in shows Google's unverified-app warning
(Advanced → Continue) because the app is personal/testing. Everything
short of Google's servers is machine-verified.

## Audit results

All six checklist items pass.
