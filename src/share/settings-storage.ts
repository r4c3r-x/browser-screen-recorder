const STORAGE_KEY = 'screen-recorder.drive-client-id';

/**
 * The OAuth client ID the user pastes once. It is a public identifier by
 * design (not a secret), but it is per-user configuration, so it lives in
 * localStorage instead of the codebase. The access token is NEVER stored.
 */
export function loadDriveClientId(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null && isValidClientId(raw)) {
      return raw;
    }
  } catch {
    // Storage unavailable (private mode): the field just starts empty.
  }
  return '';
}

export function saveDriveClientId(clientId: string): void {
  try {
    if (isValidClientId(clientId)) {
      localStorage.setItem(STORAGE_KEY, clientId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable: the value still works for this session.
  }
}

/**
 * OAuth client IDs for web apps end in .apps.googleusercontent.com and the
 * scope is bound at request time (drive.file), so shape-checking here only
 * guards against obvious typos, not security.
 */
function isValidClientId(value: string): boolean {
  return /^[0-9A-Za-z._-]+\.apps\.googleusercontent\.com$/.test(value.trim());
}
