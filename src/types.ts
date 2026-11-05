/** High-level state of a recording session. */
export type RecordingState =
  | 'idle'
  | 'requesting'
  | 'recording'
  | 'paused'
  | 'finished';

/** User-facing options for starting a recording. */
export interface StartRecordingOptions {
  /** Include microphone audio in the recording (fail-soft if denied). */
  includeMic: boolean;
}

/** Outcome of a completed recording. */
export interface RecordingResult {
  /** Encoded recording, ready for download or playback. */
  blob: Blob;
  /** Mime type the recorder actually used. */
  mimeType: string;
  /** Elapsed recording time in ms, excluding paused spans. */
  durationMs: number;
}

/** A supported recording container/codec pair. */
export interface RecordingFormat {
  mimeType: string;
  fileExtension: string;
}
