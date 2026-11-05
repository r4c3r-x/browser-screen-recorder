import './styles/base.css';
import { DOWNLOAD_URL_RELEASE_MS } from './config';
import {
  buildRecordingFilename,
  buildSrtFilename,
  buildTranscriptFilename,
  extensionFromMime,
} from './recorder/filename';
import { createRecordingSession } from './recorder/recording-session';
import { formatSrt, formatTranscript } from './transcript/srt';
import { createTranscriber } from './transcript/vosk-transcriber';
import {
  requestGoogleAccessToken,
  titleToFileName,
  uploadToDrive,
} from './share/drive-client';
import { loadDriveClientId, saveDriveClientId } from './share/settings-storage';
import type { SharePhase } from './share/drive-client';
import type {
  RecordingResult,
  SessionErrorCode,
  TranscriberPhase,
  TranscriptSegment,
} from './types';
import { createControls } from './ui/controls';
import { createErrorBanner } from './ui/error-banner';
import { createStatusPanel } from './ui/status-panel';
import { createShareControls } from './ui/share-controls';
import { createTranscriptControls } from './ui/transcript-controls';

const bannerRegion = requireElement('banner-region');
const statusRegion = requireElement('status');
const preview = requireVideo('preview');
const playback = requireVideo('playback');
const discardHint = requireElement('discard-hint');
const clientIdField = requireInput('drive-client-id');
const shareTitleField = requireInput('share-title');

const session = createRecordingSession();
const banner = createErrorBanner(bannerRegion);
const status = createStatusPanel();
const controls = createControls({
  onStart: (includeMic, includeCamera) => {
    banner.clear();
    status.reset();
    void session.start({ includeMic, includeCamera });
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

const shareControls = createShareControls({
  onShare: () => {
    if (!lastResult) {
      return;
    }
    // Without a client ID the setup field shows next to the title form;
    // sign-in happens when the user presses Upload.
    sharePhase = 'title';
    refreshShareControls();
  },
  onUpload: (title, includeTranscript) => {
    if (!lastResult) {
      return;
    }
    void startShareUpload(title, includeTranscript);
  },
  onCancel: () => {
    sharePhase = 'idle';
    shareToken = null;
    refreshShareControls();
  },
});

async function startShareUpload(title: string, includeTranscript: boolean): Promise<void> {
  if (driveClientId.trim().length === 0) {
    banner.showError('Add your Google OAuth client ID to share.');
    return;
  }

  sharePhase = 'login';
  refreshShareControls();
  try {
    const response = await requestGoogleAccessToken(driveClientId);
    if (response.type !== 'token') {
      // The user closed the Google prompt: back to the form, no error.
      sharePhase = 'title';
      refreshShareControls();
      return;
    }
    shareToken = response.accessToken;
  } catch (error) {
    sharePhase = 'error';
    refreshShareControls();
    banner.showError(
      error instanceof Error ? error.message : 'Google sign-in failed.',
    );
    return;
  }

  sharePhase = 'uploading';
  refreshShareControls();
  await uploadRecording(title, includeTranscript);
}

async function uploadRecording(title: string, includeTranscript: boolean): Promise<void> {
  if (!lastResult || !shareToken) {
    return;
  }
  try {
    const recordingName = titleToFileName(
      title,
      extensionFromMime(lastResult.mimeType),
    );
    const shared = await uploadToDrive(shareToken, recordingName, lastResult.blob, true);
    shareLink = shared.viewLink;
    if (includeTranscript && lastSegments !== null && lastSegments.length > 0) {
      // The transcript is stored under the same title but stays private.
      const transcriptName = titleToFileName(title, 'txt');
      await uploadToDrive(
        shareToken,
        transcriptName,
        new Blob([formatTranscript(lastSegments)], { type: 'text/plain' }),
        false,
      );
    }
    sharePhase = 'done';
    shareToken = null; // upload finished; the session ends here
  } catch (error) {
    sharePhase = 'error';
    banner.showError(
      error instanceof Error ? error.message : 'Sharing failed.',
    );
  }
  refreshShareControls();
}

let lastResult: RecordingResult | null = null;
let lastSegments: TranscriptSegment[] | null = null;
let transcriptPhase: TranscriberPhase = 'idle';
let lastMicIncluded = false;
let playbackUrl: string | null = null;
let sharePhase: SharePhase = 'idle';
let shareToken: string | null = null; // memory only: reload = signed out
let shareLink: string | null = null;
let driveClientId = loadDriveClientId();

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
      updateFinishHint();
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
      // Starting over invalidates the previous recording's leftovers
      // (there is no discard button: reloading or re-recording is the reset).
      lastSegments = null;
      transcriber.cancel();
      sharePhase = 'idle';
      shareToken = null;
      shareLink = null;
      showPreviewArea('live');
      preview.srcObject = event.stream;
      status.setMime(event.mimeType);
      break;
    case 'recording-complete':
      lastResult = event.result;
      lastMicIncluded = event.micIncluded;
      loadPlayback(event.result);
      updateFinishHint();
      refreshControls();
      refreshTranscriptControls();
      refreshShareControls();
      break;
    case 'notice':
      banner.showNotice(event.message);
      break;
    case 'error':
      reportError(event.code, event.message);
      break;
  }
});

// Warn before closing or reloading while a recording is active, while a
// finished recording has not been kept, or while an upload is running.
window.addEventListener('beforeunload', (event) => {
  const state = session.getState();
  const recording = state === 'recording' || state === 'paused';
  const unsaved = state === 'finished' && lastResult !== null;
  if (recording || unsaved || sharePhase === 'uploading') {
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

/** The reload-to-discard hint applies exactly while a recording is unsaved. */
function updateFinishHint(): void {
  discardHint.hidden =
    !(session.getState() === 'finished' && lastResult !== null);
}

function refreshShareControls(): void {
  shareControls.update({
    sessionFinished: session.getState() === 'finished',
    hasResult: lastResult !== null,
    phase: sharePhase,
    hasTranscript: lastSegments !== null && lastSegments.length > 0,
    shareLink,
    hasClientId: driveClientId.trim().length > 0,
  });
}

// The OAuth client ID is user configuration: pasted once, kept in this
// browser, sent only to Google. The access token is never persisted.
clientIdField.value = driveClientId;
clientIdField.addEventListener('input', () => {
  driveClientId = clientIdField.value;
  saveDriveClientId(driveClientId);
  refreshShareControls();
});
// The upload button enables as soon as the title is non-empty.
shareTitleField.addEventListener('input', () => refreshShareControls());

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

function requireInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Required input #${id} is missing from index.html.`);
  }
  return element;
}

statusRegion.hidden = true; // boot state is idle: nothing to report yet
status.reset();
updateFinishHint();
refreshControls();
refreshTranscriptControls();
refreshShareControls();
