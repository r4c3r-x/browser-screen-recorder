# Browser Screen Recorder

Records your screen (or a window or tab) directly from the browser and
downloads the file. Optional microphone and system-audio capture, pause and
resume, live duration and size readout. Nothing is uploaded: capture and
encoding happen entirely in your browser.

## Status

v1 in progress. Current stage and status: see [workspace/CONTEXT.md](workspace/CONTEXT.md).

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
npm run test        # unit tests
npm run test:e2e    # browser end-to-end (chromium)
```

These scripts appear as their stages land: unit tests in stage 02, e2e in
stage 05.

## How it works

`getDisplayMedia` captures the screen; an `AudioContext` mixes system audio
and (optionally) the microphone into one track; `MediaRecorder` encodes to
WebM, falling back to MP4 where WebM is unavailable. The mime type is
negotiated at runtime from a preference list, and the download filename is
derived from the chosen format.

## Project docs

- [PLAN.md](PLAN.md) — scope, decisions, build order (canonical)
- [AGENTS.md](AGENTS.md) — how this repository is organized and worked on
- [docs/api/](docs/api/) — local copies of the MDN pages this project relies on
- [vibe-code-rules.md](vibe-code-rules.md) — the quality standards this project follows
