# Browser Screen Recorder

Records your screen (or a window or tab) directly from the browser and
downloads the file. Optional microphone and system-audio capture, pause and
resume, live duration and size readout, and optional transcription of the
finished recording into .srt subtitles and a .txt transcript.

Privacy: recording, capture, and encoding happen entirely in your browser —
the recording itself is never uploaded. Transcription is optional and uses
your own API key (BYOK): when you run it, the recording's audio track (never
the video) is sent over HTTPS to the service you configure. The key is
stored only in your browser.

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

1. Get a free API key at [console.groq.com](https://console.groq.com) (no
   credit card; other OpenAI-compatible providers work too).
2. Open "Transcription settings" in the app, paste the key (the Groq URL
   and model are prefilled), then record.
3. After stopping, press "Transcribe recording". When it finishes, download
   the .srt subtitles or the .txt transcript.

The default service is Groq's free tier (whisper-large-v3-turbo): about
8 hours of audio per day, 25 MB per file (roughly 12 minutes of audio per
recording — longer files are rejected with a clear message before upload).

## How it works

`getDisplayMedia` captures the screen; an `AudioContext` mixes system audio
and (optionally) the microphone into one track; `MediaRecorder` encodes to
WebM, falling back to MP4 where WebM is unavailable. The mime type is
negotiated at runtime from a preference list, and the download filename is
derived from the chosen format.

Transcription decodes the recording's audio to 16 kHz mono PCM locally,
wraps it in a WAV file, and uploads that single audio file to an
OpenAI-compatible `/audio/transcriptions` endpoint. Returned segments are
rendered locally into .srt and .txt downloads.

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
