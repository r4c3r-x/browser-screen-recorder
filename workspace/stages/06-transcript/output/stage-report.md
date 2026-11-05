# Stage 06 report — transcript (online engine, SRT output)

Date: 2026-11-06. Branch: `feature/v1-transcript`.

## What exists

- Online transcription via an OpenAI-compatible `/audio/transcriptions`
  endpoint. Default preset: Groq free tier (`whisper-large-v3-turbo`, no
  credit card, ~8 h audio/day, 25 MB/file). Settings (URL, model, key) live
  in "Transcription settings"; persisted to localStorage; BYOK — no key in
  code, repo, or logs (audit-grepped).
- Only the recording's **audio track** is uploaded: decoded locally to
  16 kHz mono PCM, wrapped as WAV (~1.9 MB/min). Video never leaves the
  browser. Files above the 25 MB cap are rejected with an actionable
  message before any upload.
- Downloads: **.srt** (numbered blocks, HH:MM:SS,mmm) and **.txt**
  (timestamped lines). Pure formatters, unit-tested.
- Fail-soft paths: missing key/URL/model validated before upload with
  specific copy; provider errors mapped (401 key, 413 size, 429 rate limit);
  cancel via AbortController when the recording is discarded mid-run.
- Removed: the on-device Whisper draft (worker + transformers.js dep) after
  the user redirected the engine to an online service; uninstall verified.

## Contract amendment

The user's request ("srt generator engine online, hopefully free") revised
the stage contract before implementation continued: engine on-device →
online BYOK; output txt → srt + txt. Recorded in the contract header and in
PLAN.md's decisions log.

## Evidence

- `npm run test`: 42/42 (8 files) — WAV header/samples/clamping, SRT
  timecodes/numbering, transcript format, filenames, plus all prior suites.
- `npm run build`: exits 0; bundle 18.05 kB raw / 6.75 kB gzip (no model
  code; the on-device worker chunk is gone entirely).
- `npm run test:e2e`: 3/3 — including new assertions: transcribe enabled
  after finish, Groq URL prefilled, missing-key run shows an actionable
  error banner, discard resets transcript controls.
- Audit greps: no hardcoded keys (`api[_-]?key:` patterns), no
  transformers/worker leftovers, single fetch site (user-configured URL).

## Notes and deviations

- **Strict-mode fixes during the stage** (`noUncheckedIndexedAccess`):
  indexed reads in audio averaging, WAV sample writing, and the settings
  storage guard needed `?? 0` fallbacks / a precise type predicate.
- **vitest.config.ts added**: vitest's default glob had begun collecting
  the Playwright `.spec.ts` file; include is now unit-only.
- **A real end-to-end transcription needs a user key** and is therefore
  listed as manual verification: paste a free Groq key, transcribe a short
  recording, check the .srt opens in a player. Everything short of the
  provider round-trip is machine-verified.
- 25 MB WAV cap means ~12 minutes per transcription on Groq free; lifting
  it (audio-only opus side-track) is deferred with the other v2 items.

## Audit results

All six checklist items pass.
