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

/** Delay (ms) before revoking a download object URL so saves complete. */
export const DOWNLOAD_URL_RELEASE_MS = 10_000;

/**
 * Offline speech model for transcription (Vosk Kaldi, US English, 41 MB).
 * The official host alphacephei.com sends no CORS headers, so this is a
 * byte-identical Hugging Face mirror (verified: ACAO *). To self-host,
 * drop the zip into public/models/ and change this constant.
 */
export const VOSK_MODEL_URL =
  'https://huggingface.co/grimso/vosk-models/resolve/main/vosk-model-small-en-us-0.15.zip';

/** Sample rate (Hz) the Vosk model expects. */
export const TARGET_SAMPLE_RATE_HZ = 16_000;

/** Subtitle grouping: close a segment past this duration. */
export const TRANSCRIPT_MAX_SEGMENT_SECONDS = 5;

/** Subtitle grouping: close a segment past this character count. */
export const TRANSCRIPT_MAX_SEGMENT_CHARS = 84;

/** Subtitle grouping: a speaker pause longer than this starts a new segment. */
export const TRANSCRIPT_MAX_WORD_GAP_SECONDS = 1.5;
