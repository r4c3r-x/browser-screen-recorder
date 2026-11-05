# Stage 08 — ui revisions

One stage, one job: apply the user's four UI revisions. No new features.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | PLAN.md | All | Scope context |
| Layer 3 | workspace/_config/conventions.md | All | Copy/spacing rules |

## Revisions (user directive, 2026-11-06)

1. Transcribe button hidden unless the recording was started with
   "Include microphone" checked (the flag travels with the recording).
2. Remove the static transcription note paragraph and the "Transcript
   ready." status text; success is signaled by the download buttons
   appearing. "No speech detected", loading, and error states remain.
3. Center the "Screen Recorder" heading.
4. Keep the app maximally lightweight (verify bundle numbers; these
   revisions are removal-only).

## Process

1. Branch `feature/v1-ui-revisions`; add stage to PLAN/routing.
2. types.ts + recording-session.ts: recording-complete emits micIncluded
   (the start option in force for that recording).
3. transcript-controls.ts: hide the whole transcript block (button, SRT/TXT
   downloads, status) when micIncluded is false; drop the done-state text.
4. index.html: remove the note paragraph; base.css: center h1, drop the
   unused note style.
5. e2e: happy path records once without mic (transcribe hidden), then once
   with mic (transcribe visible, model-loading status). All suites green.
6. Report bundle sizes; README mention if numbers changed materially.

## Audit

- [ ] Transcribe block hidden for mic-less recordings, visible for mic ones
- [ ] Note paragraph and "Transcript ready." removed; loading/error/no-speech states intact
- [ ] Heading centered; no other layout drift (screenshot verified)
- [ ] Main bundle not larger; no new dependencies
- [ ] Unit + e2e green; build clean; report written

## Checkpoint

Visual screenshot check, suites green, merge to main.
