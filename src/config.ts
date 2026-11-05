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

/**
 * Recording quality presets (video/audio bitrates in bits per second).
 * Unconstrained, Chrome targets up to ~8 Mbps video: a busy 2-minute screen
 * recording costs ~120 MB. Screen content stays visually clean at a fraction
 * of that, so every preset here is a large saving:
 *   crisp    ~62 MB / 2 min,  balanced ~24 MB / 2 min,  compact ~10 MB / 2 min
 */
export interface QualityPreset {
  label: string;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;
}

export const QUALITY_PRESETS = {
  compact: { label: 'Compact', videoBitsPerSecond: 600_000, audioBitsPerSecond: 64_000 },
  balanced: { label: 'Balanced', videoBitsPerSecond: 1_500_000, audioBitsPerSecond: 96_000 },
  crisp: { label: 'Crisp', videoBitsPerSecond: 4_000_000, audioBitsPerSecond: 128_000 },
} as const satisfies Record<string, QualityPreset>;

export const DEFAULT_QUALITY: QualityKey = 'compact';

/** Hard cap on recording length (ms): the session auto-stops here. */
export const MAX_RECORDING_MS = 1_800_000;

export type QualityKey = keyof typeof QUALITY_PRESETS;

/** Subtitle grouping: close a segment past this duration. */
export const TRANSCRIPT_MAX_SEGMENT_SECONDS = 5;

/** Subtitle grouping: close a segment past this character count. */
export const TRANSCRIPT_MAX_SEGMENT_CHARS = 84;

/** Subtitle grouping: a speaker pause longer than this starts a new segment. */
export const TRANSCRIPT_MAX_WORD_GAP_SECONDS = 1.5;

/** Webcam overlay: composited frames per second. */
export const WEBCAM_FRAME_RATE = 30;

/** Webcam overlay: bubble width as a fraction of the capture width. */
export const WEBCAM_BUBBLE_WIDTH_RATIO = 0.22;

/** Webcam overlay: bubble margin from the capture edge, in px. */
export const WEBCAM_BUBBLE_MARGIN_PX = 24;
