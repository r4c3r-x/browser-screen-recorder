import { MAX_UPLOAD_BYTES } from '../config';
import type { TranscriberPhase, TranscriptSegment, TranscriptionSettings } from '../types';
import { decodeRecordingToPcm16k } from './audio-decode';
import { encodeWav } from './wav-encoder';

export interface TranscriberCallbacks {
  /** Phase changes drive the visible status line. */
  onPhase(phase: TranscriberPhase): void;
  /** Called once per run with the transcript (possibly empty). */
  onResult(segments: TranscriptSegment[]): void;
  onError(message: string): void;
}

export interface Transcriber {
  /**
   * Encode the recording's audio track and upload it to the configured
   * OpenAI-compatible endpoint. Resolves when the run finishes or is
   * stopped; results and errors also arrive via the callbacks.
   */
  transcribe(blob: Blob, settings: TranscriptionSettings): Promise<void>;
  /** Stop the current run (if any) and return to idle. */
  cancel(): void;
}

/** Segment shape returned by OpenAI-compatible verbose_json responses. */
interface ProviderSegment {
  start: number;
  end: number;
  text: string;
}

interface ProviderResponse {
  text?: string;
  segments?: ProviderSegment[] | null;
}

export function createTranscriber(callbacks: TranscriberCallbacks): Transcriber {
  let controller: AbortController | null = null;

  function isCancelled(): boolean {
    return controller === null;
  }

  return {
    async transcribe(blob, settings) {
      const validationError = validateSettings(settings);
      if (validationError !== null) {
        callbacks.onPhase('error');
        callbacks.onError(validationError);
        return;
      }

      controller = new AbortController();
      const { signal } = controller;

      try {
        callbacks.onPhase('encoding');
        const pcm = await decodeRecordingToPcm16k(blob);
        if (isCancelled()) {
          return;
        }
        const wav = encodeWav(pcm, 16_000);
        if (wav.size > MAX_UPLOAD_BYTES) {
          callbacks.onPhase('error');
          callbacks.onError(
            `The audio track is ${(wav.size / (1024 * 1024)).toFixed(1)} MB, above the provider's ` +
              `${MAX_UPLOAD_BYTES / (1024 * 1024)} MB limit (about 12 minutes of audio). ` +
              'Record a shorter clip for transcription.',
          );
          return;
        }

        callbacks.onPhase('uploading');
        const segments = await requestTranscription(wav, settings, signal);
        if (isCancelled()) {
          return;
        }
        callbacks.onPhase('done');
        callbacks.onResult(segments);
      } catch (error) {
        if (isCancelled() || (error instanceof DOMException && error.name === 'AbortError')) {
          return; // user cancelled; cancel() already set the idle phase
        }
        callbacks.onPhase('error');
        callbacks.onError(
          error instanceof Error ? error.message : 'Transcription failed.',
        );
      } finally {
        controller = null;
      }
    },

    cancel() {
      controller = null;
      callbacks.onPhase('idle');
    },
  };
}

/**
 * Upload the WAV to {baseUrl}/audio/transcriptions (OpenAI-compatible
 * schema, verbose_json for segment timestamps). The key travels only in
 * the Authorization header to the user-configured HTTPS endpoint.
 */
async function requestTranscription(
  wav: Blob,
  settings: TranscriptionSettings,
  signal: AbortSignal,
): Promise<TranscriptSegment[]> {
  const base = settings.baseUrl.trim().replace(/\/+$/, '');
  const form = new FormData();
  form.append('file', wav, 'recording.wav');
  form.append('model', settings.model.trim());
  form.append('response_format', 'verbose_json');

  const response = await fetch(`${base}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${settings.apiKey.trim()}` },
    body: form,
    signal,
  });

  if (!response.ok) {
    throw new Error(describeProviderError(response));
  }

  const data = (await response.json()) as ProviderResponse;
  return toSegments(data);
}

function toSegments(data: ProviderResponse): TranscriptSegment[] {
  const raw = data.segments ?? [];
  const segments = raw
    .map((segment) => ({
      startMs: Math.round(segment.start * 1000),
      endMs: Math.round(segment.end * 1000),
      text: String(segment.text).trim(),
    }))
    .filter((segment) => segment.text.length > 0);
  if (segments.length === 0 && typeof data.text === 'string' && data.text.trim().length > 0) {
    segments.push({ startMs: 0, endMs: 0, text: data.text.trim() });
  }
  return segments;
}

function validateSettings(settings: TranscriptionSettings): string | null {
  if (!/^https?:\/\//.test(settings.baseUrl.trim())) {
    return 'The service URL must start with https:// (see Transcription settings).';
  }
  if (settings.apiKey.trim().length === 0) {
    return 'Add your free API key under Transcription settings to transcribe. Get one at console.groq.com.';
  }
  if (settings.model.trim().length === 0) {
    return 'Choose a transcription model in Transcription settings.';
  }
  return null;
}

function describeProviderError(response: Response): string {
  const status = response.status;
  if (status === 401) {
    return 'The transcription service rejected the API key (401). Check the key in Transcription settings.';
  }
  if (status === 413) {
    return 'The audio file exceeded the provider size limit (413). Record a shorter clip.';
  }
  if (status === 429) {
    return 'The provider rate limit was reached (429). Wait a moment and try again.';
  }
  return `The transcription service returned an error (HTTP ${status}).`;
}
