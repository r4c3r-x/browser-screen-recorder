# Browser Screen Recorder

Records your screen (or a window or tab) directly from the browser and
downloads the file. Optional microphone and system-audio capture, pause and
resume, live duration and size readout, and optional transcription of the
finished recording into .srt subtitles and a .txt transcript.

Privacy: everything runs locally. Recording, encoding, and transcription
happen entirely in your browser — nothing is ever uploaded, there are no
accounts, and no API keys. Transcription uses an offline speech model that
the browser downloads once and caches.

## Status

v1 complete. Build stages and their reports live in
[workspace/CONTEXT.md](workspace/CONTEXT.md) (Interpretable Context
Methodology: the filesystem is the project's status and history).

## Requirements

- Node.js 20+ and npm (development only)
- A Chromium-based browser (Chrome or Edge) for screen + system audio
  capture. Firefox works without system audio; Safari falls back to MP4
  output. Capability differences are detected at runtime and surfaced in the
  UI.

## Setup

```
npm install
```

## Run

```
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build
```

## Test

```
npm run test        # 42 unit tests (pure logic)
npm run test:e2e    # 3 browser end-to-end tests (chromium, fake media)
```

The e2e suite runs Chromium with fake media streams and an auto-selected
capture source, so it needs no interaction. First run installs the browser
binary (`npx playwright install chromium`, ~130 MB).

## Transcription

1. Record something with speech (tick "Include microphone", or share a tab
   with audio).
2. After stopping, press "Transcribe recording". The first run downloads
   the offline speech model (~41 MB, US English) and caches it; later runs
   start instantly.
3. When it finishes, download the .srt subtitles or the .txt transcript.

The engine is [Vosk](https://alphacephei.com/vosk) (Kaldi) running as
WebAssembly inside the page: free, open-source, no account, no key, and no
audio ever leaves the machine. Accuracy is decent for clear close-mic
speech; expect weaker results on noisy or distant audio. The model URL
lives in `src/config.ts` (a CORS-enabled mirror of the official model;
self-hosting instructions are in the same file).

## How it works

`getDisplayMedia` captures the screen; an `AudioContext` mixes system audio
and (optionally) the microphone into one track; `MediaRecorder` encodes to
WebM, falling back to MP4 where WebM is unavailable. The mime type is
negotiated at runtime from a preference list, and the download filename is
derived from the chosen format.

Transcription decodes the recording's audio to 16 kHz mono PCM locally and
feeds it to the Vosk recognizer (WebAssembly). Word-level timestamps are
grouped into subtitle-sized segments and rendered locally into .srt and
.txt downloads. The 5.8 MB recognizer chunk loads lazily on first use; the
page itself stays small.

## Deploy

The app is fully static after `npm run build`: host the `dist/` directory on
any static file server. It must be served over HTTPS (or localhost) because
`getDisplayMedia` requires a secure context. No server-side component
exists; nothing is uploaded.

## Project docs

- [PLAN.md](PLAN.md) — scope, decisions, build order (canonical)
- [AGENTS.md](AGENTS.md) — how this repository is organized and worked on
- [docs/api/](docs/api/) — local copies of the MDN pages this project relies on
- [vibe-code-rules.md](vibe-code-rules.md) — the quality standards this project follows
