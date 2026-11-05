import type { RecordingFormat } from './types';

/**
 * Preference-ordered recording formats. The first one the browser reports
 * as supported wins; the file extension is derived from the chosen format.
 */
export const RECORDING_FORMATS: readonly RecordingFormat[] = [
  { mimeType: 'video/webm;codecs=vp9,opus', fileExtension: 'webm' },
  { mimeType: 'video/webm;codecs=vp8,opus', fileExtension: 'webm' },
  { mimeType: 'video/webm', fileExtension: 'webm' },
  { mimeType: 'video/mp4', fileExtension: 'mp4' },
];

/** Interval (ms) at which MediaRecorder emits chunks for size tracking. */
export const RECORDER_TIMESLICE_MS = 1000;

/** Interval (ms) between elapsed-timer UI updates. */
export const TIMER_TICK_MS = 250;

/** Prefix for downloaded recording files. */
export const RECORDING_FILENAME_PREFIX = 'screen-recording';

/** Port used by the dev server and e2e tooling. */
export const SERVER_PORT = 5173;
