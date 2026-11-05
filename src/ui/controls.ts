import type { RecordingState } from '../types';

export interface ControlHandlers {
  onStart(includeMic: boolean): void;
  onPause(): void;
  onResume(): void;
  onStop(): void;
  onDownload(): void;
  onDiscard(): void;
}

export interface Controls {
  /** Sync button visibility/enabled state and labels with session state. */
  update(state: RecordingState, hasResult: boolean): void;
}

const START_LABEL = 'Start recording';
const START_LABEL_WAITING = 'Waiting for permission…';

export function createControls(handlers: ControlHandlers): Controls {
  const start = requireButton('start');
  const pause = requireButton('pause');
  const resume = requireButton('resume');
  const stop = requireButton('stop');
  const download = requireButton('download');
  const discard = requireButton('discard');
  const includeMic = requireInput('include-mic');

  start.addEventListener('click', () => handlers.onStart(includeMic.checked));
  pause.addEventListener('click', () => handlers.onPause());
  resume.addEventListener('click', () => handlers.onResume());
  stop.addEventListener('click', () => handlers.onStop());
  download.addEventListener('click', () => handlers.onDownload());
  discard.addEventListener('click', () => handlers.onDiscard());

  return { update };

  function update(state: RecordingState, hasResult: boolean): void {
    start.hidden = state === 'recording' || state === 'paused';
    start.disabled = state === 'requesting';
    start.textContent = state === 'requesting' ? START_LABEL_WAITING : START_LABEL;
    start.setAttribute('aria-busy', String(state === 'requesting'));

    pause.hidden = state !== 'recording';
    resume.hidden = state !== 'paused';
    stop.hidden = !(state === 'recording' || state === 'paused');

    includeMic.disabled = state !== 'idle' && state !== 'finished';

    const canSave = state === 'finished' && hasResult;
    download.disabled = !canSave;
    discard.disabled = !canSave;
  }
}

function requireButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Required button #${id} is missing from index.html.`);
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
