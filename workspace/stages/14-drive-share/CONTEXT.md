# Stage 14 — share to Google Drive

One stage, one job: after a recording finishes, a Share button uploads it
(and optionally the transcript, same title) to the user's Google Drive and
produces a public view link for the recording. User request (condensed,
verbatim key parts): "after recording a Share button will appear. when
clicked will prompt you to login to your google account. once logged in,
you will be prompted to enter a title... also an option for you to also
store the transcript... automatically upload the recording and/or transcript
to google drive and generate a share link (recording only) viewable by
anyone. and reloading the page will automatically log you out of your google
account for safety reason".

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/13-compact-cap/output/stage-report.md | Full | Current state |
| Layer 3 | workspace/_config/conventions.md | All | Copy/naming |

## Process

1. Branch `feature/v1-drive-share`; add stage to PLAN/routing.
2. src/share/drive-client.ts: Google Identity Services token client
   (script injected once), requestAccessToken(clientId) with scope
   drive.file; multipart upload to /upload/drive/v3/files; permission
   anyone/reader; public link builder. Token lives in memory only (never
   localStorage): reload = logged out. Typed errors (401 re-auth, network).
3. src/share/settings-storage.ts: persist the user-pasted OAuth client ID
   (localStorage, BYO-config; not a secret by design but kept out of code).
4. src/ui/share-controls.ts: Share button (finished state only); flow:
   no client ID -> setup field shown; login -> title form (input +
   "Include transcript" checkbox, default on when a transcript exists) ->
   upload with visible progress state -> "Shared: <link>" as a real link;
   cancel button. Share button label switches to "Share again".
5. main.ts: wire share state machine (idle/login/title/uploading/done/
   error); beforeunload guard extended to uploading; on reload nothing
   persists (token gone = logged out).
6. Unit: title-to-filename sanitation, link builder. e2e: share button
   visibility, client-ID-missing setup prompt, title form appearance
   (real Google auth is manual by nature).
7. README: one-time OAuth client ID setup steps. Suites green; report.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Modules | src/share/*, src/ui/share-controls.ts | ts |
| Tests | tests/unit/share.test.ts, e2e updates | ts |

## Audit

- [ ] Token in memory only; no account data in localStorage (client ID excepted)
- [ ] Scope drive.file only; transcript uploaded but not shared publicly
- [ ] Share UI states all visible (login, title, uploading, done, error)
- [ ] beforeunload covers active upload
- [ ] No new npm dependencies (GIS loaded from Google at runtime)
- [ ] Unit + e2e green; tsc clean, no `any`; README/PLAN updated

## Checkpoint

Suites green; report; merge; deploy; user performs one real share after
creating their OAuth client ID; approval ask for approved/v5.
