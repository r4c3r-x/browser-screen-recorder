import './styles/base.css';
import { DOWNLOAD_URL_RELEASE_MS } from './config';
import {
  buildRecordingFilename,
  buildSrtFilename,
  buildTranscriptFilename,
  extensionFromMime,
} from './recorder/filename';
import { createRecordingSession } from './recorder/recording-session';
import { createTranscriber } from './transcript/vosk-transcriber';
import { formatSrt, formatTranscript } from './transcript/srt';
import type {
  RecordingResult,
  SessionErrorCode,
  TranscriberPhase,
  TranscriptSegment,
} from './types';
import { createControls } from './ui/controls';
import { createErrorBanner } from './ui/error-banner';
import { createStatusPanel } from './ui/status-panel';
import { createTranscriptControls } from './ui/transcript-controls';

const bannerRegion = requireElement('banner-region');
const statusRegion = requireElement('status');
const preview = requireVideo('preview');
const playback = requireVideo('playback');

const session = createRecordingSession();
const banner = createErrorBanner(bannerRegion);
const status = createStatusPanel();
const controls = createControls({
  onStart: (includeMic) => {
    banner.clear();
    status.reset();
    void session.start({ includeMic });
  },
  onPause: () => session.pause(),
  onResume: () => session.resume(),
  onStop: () => void session.stop(),
  onDownload: () => {
    if (lastResult) {
      downloadBlob(
        lastResult.blob,
        buildRecordingFilename(new Date(), extensionFromMime(lastResult.mimeType)),
      );
    }
  },
  onDiscard: () => {
    lastResult = null;
    lastSegments = null;
    lastMicIncluded = false;
    transcriber.cancel();
    status.reset();
    showPreviewArea('empty');
    refreshControls();
    refreshTranscriptControls();
  },
});
const transcriptControls = createTranscriptControls({
  onTranscribe: () => {
    if (lastResult) {
      void transcriber.transcribe(lastResult.blob);
    }
  },
  onDownloadTranscript: () => {
    if (lastSegments) {
      downloadBlob(
        new Blob([formatTranscript(lastSegments)], { type: 'text/plain' }),
        buildTranscriptFilename(new Date()),
      );
    }
  },
  onDownloadSrt: () => {
    if (lastSegments) {
      downloadBlob(
        new Blob([formatSrt(lastSegments)], { type: 'application/x-subrip' }),
        buildSrtFilename(new Date()),
      );
    }
  },
});

let lastResult: RecordingResult | null = null;
let lastSegments: TranscriptSegment[] | null = null;
let transcriptPhase: TranscriberPhase = 'idle';
let lastMicIncluded = false;
let playbackUrl: string | null = null;

const transcriber = createTranscriber({
  onPhase: (phase) => {
    transcriptPhase = phase;
    refreshTranscriptControls();
  },
  onResult: (segments) => {
    lastSegments = segments;
    refreshTranscriptControls();
  },
  onError: (message) => banner.showError(message),
});

const ERROR_COPY: Record<SessionErrorCode, string> = {
  'permission-denied':
    'Screen capture permission was denied. Allow screen sharing when the browser asks, then start again.',
  'no-source':
    'No capture source was available. Make sure a screen or window can be shared, then try again.',
  'source-unreadable':
    'The selected source could not be read. It may be protected or already in use. Pick a different one.',
  aborted: '', // handled as a notice, not an error
  'no-format':
    'This browser cannot record in a supported format. Try Chrome, Edge, or Firefox.',
  unknown: '',
};

session.subscribe((event) => {
  switch (event.type) {
    case 'state-changed':
      status.setState(event.state);
      // The bar only carries real information once a recording is underway;
      // an idle "Idle / 00:00 / 0 B" row is noise.
      statusRegion.hidden = event.state === 'idle';
      if (event.state === 'finished' && !lastResult) {
        showPreviewArea('empty');
      }
      refreshControls();
      refreshTranscriptControls();
      break;
    case 'elapsed-changed':
      status.setElapsed(event.elapsedMs);
      break;
    case 'size-changed':
      status.setSize(event.bytes);
      break;
    case 'capture-started':
      showPreviewArea('live');
      preview.srcObject = event.stream;
      status.setMime(event.mimeType);
      break;
    case 'recording-complete':
      lastResult = event.result;
      lastMicIncluded = event.micIncluded;
      loadPlayback(event.result);
      refreshControls();
      refreshTranscriptControls();
      break;
    case 'notice':
      banner.showNotice(event.message);
      break;
    case 'error':
      reportError(event.code, event.message);
      break;
  }
});

// Warn before closing or reloading while a recording is active.
window.addEventListener('beforeunload', (event) => {
  const state = session.getState();
  if (state === 'recording' || state === 'paused') {
    event.preventDefault();
    event.returnValue = '';
  }
});

function refreshControls(): void {
  controls.update(session.getState(), lastResult !== null);
}

function refreshTranscriptControls(): void {
  const hasSegments = lastSegments !== null && lastSegments.length > 0;
  transcriptControls.update(
    session.getState(),
    lastResult !== null,
    lastMicIncluded,
    transcriptPhase,
    hasSegments,
  );
}

function reportError(code: SessionErrorCode, rawMessage: string): void {
  if (code === 'aborted') {
    banner.showNotice('Screen capture was cancelled.');
    return;
  }
  const copy = ERROR_COPY[code];
  banner.showError(copy ? copy : `Recording failed unexpectedly. ${rawMessage}`);
}

/**
 * Three-state preview area: the muted live capture while recording, the
 * finished recording in a native-controls player after it, or nothing.
 * Exactly one state is visible at a time.
 */
function showPreviewArea(mode: 'live' | 'playback' | 'empty'): void {
  preview.hidden = mode !== 'live';
  playback.hidden = mode !== 'playback';
  if (mode !== 'live') {
    preview.srcObject = null;
  }
  if (mode !== 'playback' && playbackUrl !== null) {
    URL.revokeObjectURL(playbackUrl);
    playbackUrl = null;
    playback.removeAttribute('src');
    playback.load();
  }
}

function loadPlayback(result: RecordingResult): void {
  if (playbackUrl !== null) {
    URL.revokeObjectURL(playbackUrl);
  }
  playbackUrl = URL.createObjectURL(result.blob);
  playback.src = playbackUrl;
  showPreviewArea('playback');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  // The download starts asynchronously; revoke late so it is not cut off.
  setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_RELEASE_MS);
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required element #${id} is missing from index.html.`);
  }
  return element;
}

function requireVideo(id: string): HTMLVideoElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLVideoElement)) {
    throw new Error(`Required video #${id} is missing from index.html.`);
  }
  return element;
}

statusRegion.hidden = true; // boot state is idle: nothing to report yet
status.reset();
refreshControls();
refreshTranscriptControls();
