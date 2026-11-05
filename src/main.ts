import './styles/base.css';
import { DOWNLOAD_URL_RELEASE_MS } from './config';
import { buildRecordingFilename, extensionFromMime } from './recorder/filename';
import { createRecordingSession } from './recorder/recording-session';
import type { RecordingResult, SessionErrorCode } from './types';
import { createControls } from './ui/controls';
import { createErrorBanner } from './ui/error-banner';
import { createStatusPanel } from './ui/status-panel';

const bannerRegion = requireElement('banner-region');
const preview = requireVideo('preview');
const previewEmpty = requireElement('preview-empty');

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
      downloadResult(lastResult);
    }
  },
  onDiscard: () => {
    lastResult = null;
    status.reset();
    refreshControls();
  },
});

let lastResult: RecordingResult | null = null;

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
      if (event.state === 'finished' && !lastResult) {
        showPreview(false);
      }
      refreshControls();
      break;
    case 'elapsed-changed':
      status.setElapsed(event.elapsedMs);
      break;
    case 'size-changed':
      status.setSize(event.bytes);
      break;
    case 'capture-started':
      showPreview(true);
      preview.srcObject = event.stream;
      status.setMime(event.mimeType);
      break;
    case 'recording-complete':
      lastResult = event.result;
      refreshControls();
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

function reportError(code: SessionErrorCode, rawMessage: string): void {
  if (code === 'aborted') {
    banner.showNotice('Screen capture was cancelled.');
    return;
  }
  const copy = ERROR_COPY[code];
  banner.showError(copy ? copy : `Recording failed unexpectedly. ${rawMessage}`);
}

function showPreview(visible: boolean): void {
  preview.hidden = !visible;
  previewEmpty.hidden = visible;
  if (!visible) {
    preview.srcObject = null;
  }
}

function downloadResult(result: RecordingResult): void {
  const url = URL.createObjectURL(result.blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = buildRecordingFilename(new Date(), extensionFromMime(result.mimeType));
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

status.reset();
refreshControls();
