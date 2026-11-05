# Stage 08 report — ui revisions

Date: 2026-11-06. Branch: `feature/v1-ui-revisions`.

## Revisions applied (user directive)

1. **Transcribe button gated to mic recordings.** The session now records
   whether "Include microphone" was checked at start and emits
   `micIncluded` with `recording-complete`. The whole transcript block
   (button, .srt/.txt downloads, status) stays hidden for mic-less
   recordings; checking the box after finishing does not resurrect it.
   Semantics chosen: the *requested* option travels with the recording,
   not mic success (fail-soft recordings remain transcribable).
2. **Text removals:** the static transcription note paragraph, the
   "Transcript ready." status (success is signaled by the download buttons
   appearing), and the preview hint paragraph. Loading, no-speech, and
   error states still show text; everything else is silent.
3. **Centered heading.**
4. **Weight check:** main bundle 18.08 kB raw / 6.85 kB gzip, zero runtime
   dependencies; the 5.8 MB recognizer chunk and 41 MB model still load
   only on first Transcribe click. Removal-only changes, so numbers hold.

## Evidence

- e2e happy path restructured: records without mic (transcribe hidden),
  discards, records with mic (transcribe visible, model-loading status),
  playback assertions, discard reset. 3/3 e2e; 45/45 unit; build clean.
- Boot screenshot verified: centered title, no hint text, no note, no
  transcribe button in idle/mic-less state. One stray text (the preview
  hint) was missed in the first pass and removed after the user's list was
  re-checked against the screenshot.

## Audit results

All five checklist items pass.
