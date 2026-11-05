import { RECORDER_TIMESLICE_MS } from '../config';
import type { RecordingFormat } from '../types';

/** Result of a completed recording: encoded blob and the mime used. */
export interface RecorderStopResult {
  blob: Blob;
  mimeType: string;
}

/** Callbacks a recorder consumer must provide. */
export interface RecorderCallbacks {
  /** Called on every chunk with the accumulated byte total so far. */
  onChunk: (accumulatedBytes: number) => void;
  /** Called once on a fatal recorder error. */
  onError: (message: string) => void;
}

/** Control surface for a started MediaRecorder. */
export interface RecorderHandle {
  pause(): void;
  resume(): void;
  /** Stops recording and resolves with the complete recording. */
  stop(): Promise<RecorderStopResult>;
}

type MimeSupportPredicate = (mimeType: string) => boolean;

/**
 * Pick the first format the browser supports. Pure: the support predicate is
 * injected so tests do not need a real MediaRecorder.
 */
export function chooseRecordingFormat(
  isSupported: MimeSupportPredicate,
  formats: readonly RecordingFormat[],
): RecordingFormat | null {
  for (const format of formats) {
    if (isSupported(format.mimeType)) {
      return format;
    }
  }
  return null;
}

/**
 * Start a MediaRecorder for the given stream using the given format. Chunks
 * are accumulated for the final blob; onChunk fires per timeslice so the UI
 * can show live size.
 */
export function startRecorder(
  stream: MediaStream,
  format: RecordingFormat,
  callbacks: RecorderCallbacks,
): RecorderHandle {
  const chunks: Blob[] = [];
  let accumulatedBytes = 0;
  let stopRequested = false;

  const recorder = createRecorder(stream, format);

  recorder.addEventListener('dataavailable', (event: Event) => {
    const blobEvent = event as BlobEvent;
    if (!blobEvent.data || blobEvent.data.size === 0) {
      return;
    }
    chunks.push(blobEvent.data);
    accumulatedBytes += blobEvent.data.size;
    callbacks.onChunk(accumulatedBytes);
  });

  recorder.addEventListener('error', (event: Event) => {
    callbacks.onError(describeRecorderError(event));
  });

  recorder.start(RECORDER_TIMESLICE_MS);

  return {
    pause() {
      if (recorder.state === 'recording') {
        recorder.pause();
      }
    },
    resume() {
      if (recorder.state === 'paused') {
        recorder.resume();
      }
    },
    stop() {
      return stopRecorder(recorder, chunks, () => {
        if (stopRequested) {
          return false;
        }
        stopRequested = true;
        return true;
      });
    },
  };
}

/**
 * Construct the recorder for the preferred format. Some browsers report
 * support via isTypeSupported yet reject the exact codec string, so fall
 * back to the browser's default mime before giving up.
 */
function createRecorder(stream: MediaStream, preferred: RecordingFormat): MediaRecorder {
  try {
    return new MediaRecorder(stream, { mimeType: preferred.mimeType });
  } catch {
    return new MediaRecorder(stream);
  }
}

/**
 * Stop the recorder and resolve with the accumulated chunks. If the recorder
 * already stopped on its own (e.g. the user ended sharing), resolve with
 * what was collected. A second stop on the same handle rejects.
 */
function stopRecorder(
  recorder: MediaRecorder,
  chunks: Blob[],
  claimStop: () => boolean,
): Promise<RecorderStopResult> {
  if (recorder.state === 'inactive') {
    return Promise.resolve(buildResult(chunks, recorder.mimeType));
  }
  if (!claimStop()) {
    return Promise.reject(new Error('Stop was already requested.'));
  }
  return new Promise((resolve) => {
    recorder.addEventListener(
      'stop',
      () => resolve(buildResult(chunks, recorder.mimeType)),
      { once: true },
    );
    recorder.stop();
  });
}

function buildResult(chunks: Blob[], mimeType: string): RecorderStopResult {
  return { blob: new Blob(chunks, { type: mimeType }), mimeType };
}

/**
 * Extract a message from a recorder error event. The deprecated
 * MediaRecorderErrorEvent carried a DOMException in `.error`; current
 * browsers fire a plain Event, sometimes with the exception attached.
 */
function describeRecorderError(event: Event): string {
  const candidate = (event as { error?: { message?: string } }).error;
  if (typeof candidate?.message === 'string' && candidate.message.length > 0) {
    return candidate.message;
  }
  return 'Recording failed.';
}
