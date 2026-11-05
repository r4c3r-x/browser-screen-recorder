import {
  DEFAULT_QUALITY,
  QUALITY_PRESETS,
  RECORDING_FORMATS,
  TIMER_TICK_MS,
} from '../config';
import type {
  RecordingFormat,
  RecordingResult,
  RecordingState,
  SessionEvent,
  SessionErrorCode,
  StartRecordingOptions,
} from '../types';
import { createMixedAudio } from './audio-mixer';
import { requestCameraCapture, type CameraSource } from './camera-source';
import {
  ScreenCaptureError,
  requestScreenCapture,
  type CaptureSource,
} from './capture-source';
import { createCanvasCompositor } from './canvas-compositor';
import { createElapsedTracker, type ElapsedTracker } from './elapsed-time';
import {
  chooseRecordingFormat,
  startRecorder,
  type RecorderHandle,
  type RecorderStopResult,
} from './media-recorder';

const VALID_TRANSITIONS: Record<RecordingState, readonly RecordingState[]> = {
  idle: ['requesting'],
  requesting: ['recording', 'idle'],
  recording: ['paused', 'finished'],
  paused: ['recording', 'finished'],
  finished: ['idle'],
};

/** Whether a state transition is legal. Pure and unit-tested. */
export function canTransition(from: RecordingState, to: RecordingState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export interface RecordingSession {
  start(options: StartRecordingOptions): Promise<void>;
  pause(): void;
  resume(): void;
  /** Stop and produce the result, or null if nothing was recorded. */
  stop(): Promise<RecordingResult | null>;
  getState(): RecordingState;
  /** Subscribe to session events; returns an unsubscribe function. */
  subscribe(listener: (event: SessionEvent) => void): () => void;
}

export function createRecordingSession(): RecordingSession {
  let state: RecordingState = 'idle';
  let capture: CaptureSource | null = null;
  let recorderHandle: RecorderHandle | null = null;
  let tracker: ElapsedTracker | null = null;
  let micStream: MediaStream | null = null;
  let mixedAudio: ReturnType<typeof createMixedAudio> | null = null;
  let timerHandle: ReturnType<typeof setInterval> | null = null;
  const listeners = new Set<(event: SessionEvent) => void>();
  let requestedMic = false;
  let cameraSource: CameraSource | null = null;
  let compositor: Awaited<ReturnType<typeof createCanvasCompositor>> | null = null;

  function emit(event: SessionEvent): void {
    for (const listener of listeners) {
      listener(event);
    }
  }

  function setState(next: RecordingState): void {
    if (!canTransition(state, next)) {
      throw new Error(`Invalid session state transition: ${state} -> ${next}`);
    }
    state = next;
    emit({ type: 'state-changed', state });
  }

  async function start(options: StartRecordingOptions): Promise<void> {
    if (state !== 'idle' && state !== 'finished') {
      emit({ type: 'notice', message: 'A recording is already in progress.' });
      return;
    }
    if (state === 'finished') {
      setState('idle');
    }

    // No await may happen before getDisplayMedia: the browser requires
    // transient user activation at call time.
    setState('requesting');
    const format = chooseRecordingFormat(
      (mime) => MediaRecorder.isTypeSupported(mime),
      RECORDING_FORMATS,
    );
    if (format === null) {
      emit({
        type: 'error',
        message: 'This browser does not support any recording format this app can use.',
        code: 'no-format',
      });
      setState('idle');
      return;
    }

    try {
      capture = await requestScreenCapture();
    } catch (error) {
      emit({
        type: 'error',
        message: error instanceof Error ? error.message : 'Screen capture failed.',
        code: toErrorCode(error),
      });
      setState('idle');
      return;
    }

    micStream = options.includeMic ? await requestMicFailSoft() : null;
    requestedMic = options.includeMic;
    cameraSource = options.includeCamera ? await requestCameraFailSoft() : null;
    await beginRecording(format, QUALITY_PRESETS[DEFAULT_QUALITY]);
  }

  async function requestCameraFailSoft(): Promise<CameraSource | null> {
    try {
      return await requestCameraCapture();
    } catch {
      emit({
        type: 'notice',
        message: 'Camera unavailable. Recording without the camera bubble.',
      });
      return null;
    }
  }

  async function beginRecording(
    format: RecordingFormat,
    bitrates: { videoBitsPerSecond: number; audioBitsPerSecond: number },
  ): Promise<void> {
    if (!capture) {
      return;
    }
    const activeCapture = capture;
    const videoTrack = activeCapture.stream.getVideoTracks()[0];
    if (!videoTrack) {
      emit({ type: 'error', message: 'Capture returned no video track.', code: 'no-source' });
      cleanupResources();
      setState('idle');
      return;
    }

    const systemAudioTrack = activeCapture.stream.getAudioTracks()[0] ?? null;
    const micTrack = micStream?.getAudioTracks()[0] ?? null;
    mixedAudio = createMixedAudio(systemAudioTrack, micTrack);
    const audioTrack = mixedAudio.track;

    // The recorded video is either the raw screen track or the composited
    // screen + camera bubble. Audio never touches the compositor.
    let recordedVideoTrack: MediaStreamTrack = videoTrack;
    if (cameraSource) {
      compositor = await createCanvasCompositor(activeCapture.stream, cameraSource.track);
      const compositeTrack = compositor.canvasStream.getVideoTracks()[0];
      if (compositeTrack) {
        recordedVideoTrack = compositeTrack;
      }
    }

    tracker = createElapsedTracker(Date.now());
    recorderHandle = startRecorder(
      new MediaStream(audioTrack ? [recordedVideoTrack, audioTrack] : [recordedVideoTrack]),
      format,
      bitrates,
      {
        onChunk: (bytes) => emit({ type: 'size-changed', bytes }),
        onError: (message) => {
          emit({ type: 'error', message, code: 'unknown' });
          void finishFromInterruption();
        },
      },
    );

    timerHandle = setInterval(() => {
      if (tracker) {
        emit({ type: 'elapsed-changed', elapsedMs: tracker.elapsedMs(Date.now()) });
      }
    }, TIMER_TICK_MS);

    setState('recording');
    emit({
      type: 'capture-started',
      stream: new MediaStream([recordedVideoTrack]),
      mimeType: format.mimeType,
    });
    void activeCapture.ended.then(() => {
      if (state === 'recording' || state === 'paused') {
        void finishFromInterruption();
      }
    });
  }

  async function requestMicFailSoft(): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      emit({
        type: 'notice',
        message: 'Microphone unavailable. Recording without microphone audio.',
      });
      if (error instanceof Error && error.name !== 'NotAllowedError') {
        console.warn(`Mic capture failed: ${error.name}`);
      }
      return null;
    }
  }

  function pause(): void {
    if (state !== 'recording') {
      return;
    }
    recorderHandle?.pause();
    tracker?.pause(Date.now());
    setState('paused');
  }

  function resume(): void {
    if (state !== 'paused') {
      return;
    }
    recorderHandle?.resume();
    tracker?.resume(Date.now());
    setState('recording');
  }

  async function stop(): Promise<RecordingResult | null> {
    if (state !== 'recording' && state !== 'paused') {
      return null;
    }
    return stopRecording();
  }

  /** Graceful finish when recording is interrupted (share ended, error). */
  async function finishFromInterruption(): Promise<void> {
    if (state !== 'recording' && state !== 'paused') {
      return;
    }
    await stopRecording();
  }

  async function stopRecording(): Promise<RecordingResult | null> {
    const durationMs = tracker ? tracker.elapsedMs(Date.now()) : 0;
    stopTimer();
    let stopResult: RecorderStopResult | null = null;
    if (recorderHandle) {
      try {
        stopResult = await recorderHandle.stop();
      } catch {
        stopResult = null;
      }
    }
    cleanupResources();
    setState('finished');
    const result: RecordingResult | null = stopResult
      ? { blob: stopResult.blob, mimeType: stopResult.mimeType, durationMs }
      : null;
    if (result !== null) {
      emit({ type: 'recording-complete', result, micIncluded: requestedMic });
    }
    return result;
  }

  function cleanupResources(): void {
    capture?.dispose();
    capture = null;
    micStream?.getTracks().forEach((track) => track.stop());
    micStream = null;
    compositor?.stop();
    compositor = null;
    cameraSource?.dispose();
    cameraSource = null;
    mixedAudio?.stop();
    mixedAudio = null;
    recorderHandle = null;
    tracker = null;
  }

  function stopTimer(): void {
    if (timerHandle !== null) {
      clearInterval(timerHandle);
      timerHandle = null;
    }
  }

  function toErrorCode(error: unknown): SessionErrorCode {
    return error instanceof ScreenCaptureError ? error.code : 'unknown';
  }

  return {
    start,
    pause,
    resume,
    stop,
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
