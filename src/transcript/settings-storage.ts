import {
  DEFAULT_TRANSCRIPTION_BASE_URL,
  DEFAULT_TRANSCRIPTION_MODEL,
  TRANSCRIPTION_SETTINGS_STORAGE_KEY,
} from '../config';
import type { TranscriptionSettings } from '../types';

/**
 * Persist user transcription settings in localStorage. The API key is
 * user-supplied (BYOK): it never enters the codebase and is sent only to
 * the provider the user configured, over HTTPS.
 */
export function loadTranscriptionSettings(): TranscriptionSettings {
  const fallback: TranscriptionSettings = {
    baseUrl: DEFAULT_TRANSCRIPTION_BASE_URL,
    model: DEFAULT_TRANSCRIPTION_MODEL,
    apiKey: '',
  };
  try {
    const raw = localStorage.getItem(TRANSCRIPTION_SETTINGS_STORAGE_KEY);
    if (raw === null) {
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isSettingsShape(parsed)) {
      return fallback;
    }
    return {
      baseUrl: parsed.baseUrl || fallback.baseUrl,
      model: parsed.model || fallback.model,
      apiKey: parsed.apiKey,
    };
  } catch {
    return fallback;
  }
}

export function saveTranscriptionSettings(settings: TranscriptionSettings): void {
  try {
    localStorage.setItem(TRANSCRIPTION_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage may be unavailable (private mode); transcription still works
    // for this session with the values currently in the form.
  }
}

function isSettingsShape(value: unknown): value is TranscriptionSettings {
  return (
    typeof value === 'object' &&
    value !== null &&
    'baseUrl' in value &&
    'model' in value &&
    'apiKey' in value &&
    typeof (value as { baseUrl: unknown }).baseUrl === 'string' &&
    typeof (value as { model: unknown }).model === 'string' &&
    typeof (value as { apiKey: unknown }).apiKey === 'string'
  );
}
