import { TARGET_SAMPLE_RATE_HZ, VOSK_MODEL_URL } from '../config';
import type { KaldiRecognizer, Model } from 'vosk-browser';
import type { TranscriberPhase, TranscriptSegment } from '../types';
import { decodeRecordingToPcm16k } from './audio-decode';
import { groupWordsIntoSegments, type RecognizedWord } from './words-to-segments';

export interface TranscriberCallbacks {
  /** Phase changes drive the visible status line. */
  onPhase(phase: TranscriberPhase): void;
  /** Called once per run with the transcript (possibly empty). */
  onResult(segments: TranscriptSegment[]): void;
  onError(message: string): void;
}

export interface Transcriber {
  /** Transcribe a recording blob fully offline. */
  transcribe(blob: Blob): Promise<void>;
  /** Invalidate the current run and return to idle. */
  cancel(): void;
}

// The model loads once and is reused across runs. vosk-browser is imported
// dynamically, so its ~6 MB wasm chunk never touches the initial page load.
let modelPromise: Promise<Model> | null = null;

function loadModel(): Promise<Model> {
  modelPromise ??= import('vosk-browser').then((vosk) => vosk.createModel(VOSK_MODEL_URL));
  return modelPromise;
}

export function createTranscriber(callbacks: TranscriberCallbacks): Transcriber {
  let runCancelled = false;
  let recognizer: KaldiRecognizer | null = null;

  return {
    async transcribe(blob) {
      runCancelled = false;
      try {
        callbacks.onPhase('loading-model');
        const model = await loadModel();
        if (runCancelled) {
          return;
        }
        if (!model.ready) {
          throw new Error(
            'The offline speech model failed to load. Check your connection and try again.',
          );
        }

        callbacks.onPhase('transcribing');
        const current = new model.KaldiRecognizer(TARGET_SAMPLE_RATE_HZ);
        current.setWords(true);
        recognizer = current;

        const pcm = await decodeRecordingToPcm16k(blob);
        if (runCancelled) {
          return;
        }
        if (pcm.length === 0) {
          callbacks.onPhase('error');
          callbacks.onError('The recording contains no audio track.');
          return;
        }

        const words = await recognizeWords(current, pcm);
        recognizer = null;
        current.remove();
        if (runCancelled) {
          return;
        }

        callbacks.onPhase('done');
        callbacks.onResult(groupWordsIntoSegments(words));
      } catch (error) {
        if (runCancelled) {
          return;
        }
        callbacks.onPhase('error');
        callbacks.onError(
          error instanceof Error ? error.message : 'Transcription failed.',
        );
      }
    },

    cancel() {
      runCancelled = true;
      recognizer?.remove();
      recognizer = null;
      callbacks.onPhase('idle');
    },
  };
}

/**
 * Feed the whole recording to Kaldi and resolve with the word-level result.
 * If the run is cancelled, the recognizer is removed and the promise never
 * settles; the orphan is harmless because its consumer has moved on.
 */
async function recognizeWords(
  kaldi: KaldiRecognizer,
  pcm: Float32Array,
): Promise<RecognizedWord[]> {
  return new Promise((resolve, reject) => {
    kaldi.on('result', (message) => {
      if (message.event === 'result') {
        // Silence (or an empty grammar hit) yields { text } without a
        // result array; treat that as zero words.
        resolve(message.result.result ?? []);
      }
    });
    kaldi.on('error', (message) => {
      if (message.event === 'error') {
        reject(new Error(message.error));
      }
    });
    kaldi.acceptWaveformFloat(pcm, TARGET_SAMPLE_RATE_HZ);
    kaldi.retrieveFinalResult();
  });
}
