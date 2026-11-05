/** Error classification for display-capture failures. */
export type ScreenCaptureErrorCode =
  | 'permission-denied'
  | 'no-source'
  | 'source-unreadable'
  | 'aborted'
  | 'unknown';

/** A display-capture failure with a code the UI can map to a message. */
export class ScreenCaptureError extends Error {
  readonly code: ScreenCaptureErrorCode;

  constructor(code: ScreenCaptureErrorCode, message: string) {
    super(message);
    this.name = 'ScreenCaptureError';
    this.code = code;
  }
}

/** A live display capture: the stream, its end signal, and teardown. */
export interface CaptureSource {
  stream: MediaStream;
  /**
   * Resolves when the user stops sharing from the browser UI (video track
   * ended). A normal stop via dispose() does not resolve it early; dispose
   * stops the tracks first, so consumers should race stop-completion
   * against this.
   */
  ended: Promise<void>;
  /** Stop every track and release the capture. */
  dispose(): void;
}

/**
 * Prompt the user to pick a screen/window/tab and start capturing. Audio is
 * requested so the browser can offer system/tab audio; the mixer decides
 * later whether to use it.
 */
export async function requestScreenCapture(): Promise<CaptureSource> {
  const stream = await navigator.mediaDevices
    .getDisplayMedia(buildDisplayMediaOptions())
    .catch((error: unknown) => {
      throw toScreenCaptureError(error);
    });

  const videoTrack = stream.getVideoTracks()[0];
  if (!videoTrack) {
    stream.getTracks().forEach((track) => track.stop());
    throw new ScreenCaptureError('no-source', 'Capture returned no video track.');
  }

  const ended = new Promise<void>((resolve) => {
    videoTrack.addEventListener('ended', () => resolve(), { once: true });
  });

  return {
    stream,
    ended,
    dispose() {
      stream.getTracks().forEach((track) => track.stop());
    },
  };
}

/**
 * Build getDisplayMedia options. systemAudio/surfaceSwitching are Chrome
 * hints not yet in the TypeScript DOM types; the cast keeps strict typing
 * while passing them at runtime (other browsers ignore them).
 */
function buildDisplayMediaOptions(): DisplayMediaStreamOptions {
  const options = {
    video: true,
    audio: true,
    systemAudio: 'include',
    surfaceSwitching: 'include',
  };
  return options as DisplayMediaStreamOptions;
}

/** Map a getDisplayMedia failure to a stable error code. */
function toScreenCaptureError(error: unknown): ScreenCaptureError {
  if (error instanceof DOMException || error instanceof Error) {
    return new ScreenCaptureError(classify(error.name), error.message);
  }
  return new ScreenCaptureError('unknown', String(error));
}

function classify(name: string): ScreenCaptureErrorCode {
  switch (name) {
    case 'NotAllowedError':
      return 'permission-denied';
    case 'NotFoundError':
      return 'no-source';
    case 'NotReadableError':
      return 'source-unreadable';
    case 'AbortError':
      return 'aborted';
    default:
      return 'unknown';
  }
}
