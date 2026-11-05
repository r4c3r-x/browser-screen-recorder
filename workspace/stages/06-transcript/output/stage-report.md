# Stage 06 report — transcript (revision 2: offline Vosk, no AI services)

Date: 2026-11-06. Branch: `feature/v1-transcript`.

## Revision history (user-directed)

1. Initial: on-device Whisper draft (transformers.js worker).
2. Revised: online BYOK transcription (OpenAI-compatible endpoint, SRT+TXT).
3. Final directive: "free ones only, no AI" — the online engine was removed
   entirely and replaced with Vosk (Kaldi) running offline in the browser.
   No keys, no accounts, no uploads of any kind.

## What exists

- `src/transcript/vosk-transcriber.ts` — lazily imports vosk-browser (its
  5.8 MB wasm chunk is code-split away from the 18 kB main bundle), caches
  the 41 MB US-English model across runs, decodes the recording to 16 kHz
  mono PCM (existing audio-decode), feeds `acceptWaveformFloat`, collects
  word timestamps, and cancels cleanly (recognizer removed, run invalidated).
- `src/transcript/words-to-segments.ts` — pure grouping of recognized words
  into subtitle segments by max duration (5 s), char budget (84), speaker
  gap (1.5 s), and sentence-ending punctuation. Unit-tested.
- SRT/TXT formatters and download buttons unchanged from revision 2.
- Model URL: CORS-verified Hugging Face mirror of
  `vosk-model-small-en-us-0.15` (alphacephei.com sends no CORS headers;
  mirror serves the identical 41,205,931-byte file with ACAO *).
  Self-host fallback documented at the constant in config.ts.
- UI: the provider settings fieldset is gone, replaced by an honest note
  (offline, first-run 41 MB model, nothing uploaded).

## Evidence

- **Real-browser pipeline verification** (`scripts/verify-vosk-pipeline.mjs`,
  one-off, not in the suite): fresh Chromium with fake media — record 3 s →
  stop → Transcribe → model downloaded and unpacked, Kaldi initialized
  (i-vector, HCLr/Gr, word boundaries logged), final result handled:
  status reached "No speech detected in this recording." with session
  Finished. That is the correct terminal state for the tone that fake media
  produces, and it proves download → wasm → inference → result → UI.
- `npm run test`: 45/45 (word grouping, SRT timecodes, filenames, all prior
  suites). `npm run build`: clean; `vosk` chunk 5,785.93 kB (2,384 kB gzip)
  split from the 18.08 kB main bundle. `npm run test:e2e`: 3/3 after one
  load-induced flake (see notes).

## Debugging record (vibe §6)

- First verification run failed with `words is not iterable`. Traced
  through the base64-embedded worker source in vosk.js: the worker posts
  `JSON.parse(wasm.FinalResult())` verbatim. Fake media produces no speech,
  so Kaldi returned `{ text: "" }` with no `result` key; my resolve passed
  `undefined` into the grouper's `for...of`. Fix: default the missing
  array to `[]` (`message.result.result ?? []`). One line; rerun PASS.
- e2e full run had one failure of the mic-denied test that passed in
  isolation and on full rerun — load-induced flake right after test 1's
  aborted 41 MB fetch. No code change; noted for future CI stability work.

## Manual verification remaining (user)

One real spoken transcription: record yourself speaking via mic, press
Transcribe, check the .srt in a player. Everything except human speech is
machine-verified. The user's browser will download the model once.

## Audit results

All six checklist items pass (single network site = model URL only; no
keys/accounts/provider settings; SRT shape tested; main bundle unaffected;
phase/error copy complete; tests+build green; README/PLAN updated).
