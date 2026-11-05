# Stage 06 — transcript (revised: online engine, SRT output)

One stage, one job: transcribe the finished recording via a user-configured
online service (BYO key) and download the result as .srt and .txt.
Amendment note: the user redirected the engine from on-device Whisper to an
online free-tier service and requested SRT output; this contract was
revised before implementation continued.

## Inputs

| Source | Path | Sections | Why |
|---|---|---|---|
| Layer 4 | stages/05-integration-audit/output/stage-report.md | Full | v1 state |
| Layer 4 | PLAN.md | Decisions log | Engine choice rationale |
| Layer 3 | workspace/_config/conventions.md | All | Naming/copy/spacing |

## Process

1. Branch `feature/v1-transcript`; record the engine decision in PLAN.md.
2. Remove the unused transformers.js dependency and the worker draft; the
   online engine needs no worker.
3. src/transcript/wav-encoder.ts (pure): 16 kHz mono PCM to WAV bytes.
   Rationale: uploads the audio track only (never video), universally
   accepted, ~1.9 MB/minute so the 25 MB free-tier cap covers ~13 minutes.
4. src/transcript/srt.ts (pure): segments to SRT (HH:MM:SS,mmm blocks) and
   timestamped .txt.
5. src/transcript/transcriber.ts (rewrite): OpenAI-compatible
   /audio/transcriptions client — FormData upload, verbose_json segments,
   AbortController cancel, typed phases. Settings (base URL, model, key)
   persisted in localStorage under one key; key is user-supplied (BYOK),
   never committed, sent only to the configured provider over HTTPS.
6. src/ui/transcript-controls.ts + index.html: settings fieldset, phase
   status, .srt/.txt download buttons, size-cap error surfaced in banner.
7. README privacy copy updated honestly: recording stays local; optional
   transcription sends the audio track to the chosen provider.
8. Unit tests: WAV header/lengths, SRT timecodes/numbering, TXT format.
   e2e: controls and states (no real key in tests). Manual: one real
   transcription by the user.
9. `npm run test` + `npm run build` green; README/PLAN updated.

## Outputs

| Artifact | Path | Format |
|---|---|---|
| Stage report | output/stage-report.md | md |
| Modules | src/transcript/*, src/ui/transcript-controls.ts | ts |
| Tests | tests/unit/*.test.ts, tests/e2e addition | ts |

## Audit

- [ ] No API key in code, repo, or logs; key only in localStorage, set by the user
- [ ] Only the audio track is uploaded, over HTTPS, to the user-configured provider
- [ ] 25 MB cap enforced with a visible, actionable error before upload
- [ ] SRT is spec-shaped (numbered blocks, HH:MM:SS,mmm arrow lines, blank-line separated)
- [ ] Every phase visible (settings missing, uploading, done, error); tsc clean, no `any`
- [ ] Unit tests green; build green; README/PLAN updated

## Checkpoint

Browser-verified boot and states; user performs one real transcription
(their key); report written; merge to main.
