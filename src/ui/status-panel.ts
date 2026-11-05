import type { RecordingState } from '../types';
import { formatBytes, formatElapsed, formatMimeLabel } from './format';

export interface StatusPanel {
  setState(state: RecordingState): void;
  setElapsed(elapsedMs: number): void;
  setSize(bytes: number): void;
  setMime(mimeType: string): void;
  /** Clear timer, size, and mime badge for a fresh session. */
  reset(): void;
}

const STATE_LABELS: Record<RecordingState, string> = {
  idle: 'Idle',
  requesting: 'Waiting',
  recording: 'Recording',
  paused: 'Paused',
  finished: 'Finished',
};

const STATE_CLASSES: Record<RecordingState, string> = {
  idle: 'state-idle',
  requesting: 'state-requesting',
  recording: 'state-recording',
  paused: 'state-paused',
  finished: 'state-finished',
};

export function createStatusPanel(): StatusPanel {
  const chip = requireElement('state-chip');
  const elapsed = requireElement('elapsed');
  const size = requireElement('size');
  const mime = requireElement('mime');

  return {
    setState(state) {
      chip.textContent = STATE_LABELS[state];
      chip.className = `state-chip ${STATE_CLASSES[state]}`;
    },
    setElapsed(elapsedMs) {
      elapsed.textContent = formatElapsed(elapsedMs);
    },
    setSize(bytes) {
      size.textContent = formatBytes(bytes);
    },
    setMime(mimeType) {
      mime.hidden = false;
      mime.textContent = formatMimeLabel(mimeType);
      mime.title = mimeType;
    },
    reset() {
      elapsed.textContent = formatElapsed(0);
      size.textContent = formatBytes(0);
      mime.hidden = true;
      mime.textContent = '';
      mime.title = '';
    },
  };
}

function requireElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required status element #${id} is missing from index.html.`);
  }
  return element;
}
