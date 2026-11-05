import type { RecordingState, TranscriberPhase } from '../types';

export interface TranscriptControlHandlers {
  onTranscribe(): void;
  onDownloadTranscript(): void;
  onDownloadSrt(): void;
}

export interface TranscriptControls {
  /**
   * Sync transcript controls with session state, whether a recording is
   * waiting, the transcriber phase, and whether segments exist.
   */
  update(
    state: RecordingState,
    hasResult: boolean,
    phase: TranscriberPhase,
    hasSegments: boolean,
  ): void;
}

export function createTranscriptControls(handlers: TranscriptControlHandlers): TranscriptControls {
  const transcribe = requireButton('transcribe');
  const downloadTranscript = requireButton('download-transcript');
  const downloadSrt = requireButton('download-srt');
  const status = requireParagraph('transcript-status');

  transcribe.addEventListener('click', () => handlers.onTranscribe());
  downloadTranscript.addEventListener('click', () => handlers.onDownloadTranscript());
  downloadSrt.addEventListener('click', () => handlers.onDownloadSrt());

  return { update };

  function update(
    state: RecordingState,
    hasResult: boolean,
    phase: TranscriberPhase,
    hasSegments: boolean,
  ): void {
    const busy = phase === 'loading-model' || phase === 'transcribing';
    transcribe.disabled = !(state === 'finished' && hasResult && !busy);

    const canSave = phase === 'done' && hasSegments;
    downloadTranscript.hidden = !canSave;
    downloadSrt.hidden = !canSave;

    if (phase === 'idle') {
      status.hidden = true;
      status.textContent = '';
      return;
    }
    status.hidden = false;
    status.textContent = statusTextFor(phase, hasSegments);
  }

  function statusTextFor(phase: TranscriberPhase, hasSegments: boolean): string {
    switch (phase) {
      case 'loading-model':
        return 'Loading the offline speech model… (41 MB, first run only)';
      case 'transcribing':
        return 'Transcribing…';
      case 'done':
        return hasSegments ? 'Transcript ready.' : 'No speech detected in this recording.';
      case 'error':
        return 'Transcription failed.';
      case 'idle':
        return '';
    }
  }
}

function requireButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Required button #${id} is missing from index.html.`);
  }
  return element;
}

function requireParagraph(id: string): HTMLParagraphElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLParagraphElement)) {
    throw new Error(`Required paragraph #${id} is missing from index.html.`);
  }
  return element;
}
