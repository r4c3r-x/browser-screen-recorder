# Stage 06 — transcript (revision 2: offline Vosk only, no AI services)

One stage, one job: transcribe the finished recording with an offline
in-browser Kaldi engine (Vosk via vosk-browser WASM) and download the
result as .srt and .txt. Revision history: (1) on-device Whisper draft,
(2) online BYOK engine, (3) user directive "free only, no AI services" —
this revision removes the online engine entirely. No keys, no accounts,
no uploads of any kind.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/05-integration-audit/output/stage-report.md | Full | v1 state |
| Layer 4 | PLAN.md | Decisions log | Engine choice rationale |
| Layer 3 | workspace/_config/conventions.md | All | Naming/copy/spacing |

## Process

1. On `feature/v1-transcript`: amend PLAN.md decision log (engine = Vosk
   offline per user directive; online engine removed).
2. Remove the online path: transcriber.ts (HTTP client), settings-storage,
   WAV encoder + its tests, provider constants, settings fieldset UI.
3. Add `vosk-browser` (runtime dep, dynamically imported on first use so
   the main bundle is unaffected).
4. src/transcript/words-to-segments.ts (pure): vosk word list (conf, start,
   end, word) to subtitle segments by max duration/chars/gap and sentence
   punctuation. Unit-tested.
5. src/transcript/vosk-transcriber.ts: lazy-import vosk-browser; cache the
   model across runs; decode recording to 16 kHz mono PCM (existing
   audio-decode), wrap in an AudioBuffer, feed the recognizer, collect
   word timestamps, group into segments. Typed module declaration for the
   library.
6. Model URL: CORS-verified Hugging Face mirror (alphacephei.com sends no
   CORS headers; mirror serves the identical 41.2 MB file with ACAO *).
   Constant in config.ts; self-host fallback documented in the error copy.
7. index.html/controls: settings fieldset replaced by an honest note
   (offline, first-run 41 MB model download, cached); phases: loading
   model, transcribing, done, error.
8. Unit tests: word grouping, SRT/TXT formatters (kept), filenames.
   e2e: transcribe click shows the loading state (no 41 MB download in
   tests); manual verification: one real transcription in-browser.
9. `npm run test` + `npm run build` green; README rewritten (fully
   offline, nothing ever uploaded).

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Modules | src/transcript/*, src/ui/transcript-controls.ts | ts |
| Tests | tests/unit/*.test.ts, tests/e2e addition | ts |

## Audit

- [ ] Zero network calls except the one-time model download (grep: single fetch/import site)
- [ ] No keys, no accounts, no settings for providers anywhere in the UI
- [ ] SRT is spec-shaped; grouping rules unit-tested (duration/chars/gap/sentence)
- [ ] Main bundle unaffected by vosk (dynamic import, separate chunk)
- [ ] Every phase visible; error copy explains first-run download and self-host fallback
- [ ] Unit tests green; build green; tsc clean, no `any`; README/PLAN updated

## Checkpoint

Browser-verified pipeline (real model load; fake-media recording yields a
graceful no-speech result); user runs one real spoken transcription; report
written; merge to main.
