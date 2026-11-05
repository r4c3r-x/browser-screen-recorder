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

/** Stable codes the UI maps to user-facing copy. */
export type SessionErrorCode =
  | 'permission-denied'
  | 'no-source'
  | 'source-unreadable'
  | 'aborted'
  | 'no-format'
  | 'unknown';

/** Events emitted by a RecordingSession for the UI. */
export type SessionEvent =
  | { type: 'state-changed'; state: RecordingState }
  | { type: 'elapsed-changed'; elapsedMs: number }
  | { type: 'size-changed'; bytes: number }
  /** Capture is live; the UI may preview this stream. */
  | { type: 'capture-started'; stream: MediaStream; mimeType: string }
  /** A recording finished (user stop or share end); blob is ready. */
  | { type: 'recording-complete'; result: RecordingResult }
  /** Non-fatal: recording continues (e.g. mic unavailable). */
  | { type: 'notice'; message: string }
  /** Fatal for the current start attempt; session returns to a stable state. */
  | { type: 'error'; message: string; code: SessionErrorCode };
