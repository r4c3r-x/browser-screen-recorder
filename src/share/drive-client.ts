/**
 * Google Drive sharing client. Uses Google Identity Services (loaded from
 * Google at runtime) for an in-memory access token and the Drive REST API
 * for upload + sharing. The token is never persisted: reloading the page
 * logs the user out, by design.
 *
 * Scope is drive.file: the app can only see and touch files it created
 * through this flow, never the rest of the user's Drive.
 */

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

export type SharePhase =
  | 'idle'
  | 'login'
  | 'title'
  | 'uploading'
  | 'done'
  | 'error';

export interface ShareFileResult {
  /** https://drive.google.com/file/d/<id>/view — works once shared publicly. */
  viewLink: string;
}

interface TokenClientOptions {
  clientId: string;
  scope: string;
  callback: (response: { access_token?: string; error?: string }) => void;
}

interface TokenClient {
  requestAccessToken(options?: { prompt?: string }): void;
}

interface GoogleGlobal {
  accounts: {
    oauth2: {
      initTokenClient(options: TokenClientOptions): TokenClient;
    };
  };
}

type TokenResponse =
  | { type: 'token'; accessToken: string }
  | { type: 'closed' };

export type ShareErrorCode =
  | 'auth-closed'
  | 'auth-failed'
  | 'upload-failed'
  | 'share-failed'
  | 'no-client-id';

export class ShareError extends Error {
  readonly code: ShareErrorCode;

  constructor(code: ShareErrorCode, message: string) {
    super(message);
    this.name = 'ShareError';
    this.code = code;
  }
}

/** Load the GIS script once; resolves when google.accounts.oauth2 exists. */
async function loadIdentityServices(): Promise<GoogleGlobal> {
  const existing = globalThis as { google?: GoogleGlobal };
  if (existing.google?.accounts?.oauth2) {
    return existing.google;
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in.'));
    document.head.append(script);
  });
  const google = (globalThis as { google?: GoogleGlobal }).google;
  if (!google?.accounts?.oauth2) {
    throw new Error('Google sign-in is unavailable in this browser.');
  }
  return google;
}

/**
 * Open the Google sign-in flow and resolve with the access token. Resolves
 * { type: 'closed' } if the user closes the prompt. The token is kept by
 * the caller in memory only.
 */
export async function requestGoogleAccessToken(clientId: string): Promise<TokenResponse> {
  if (clientId.trim().length === 0) {
    throw new ShareError('no-client-id', 'Add your Google OAuth client ID first.');
  }
  const google = await loadIdentityServices();
  return new Promise((resolve) => {
    const client = google.accounts.oauth2.initTokenClient({
      clientId: clientId.trim(),
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.access_token) {
          resolve({ type: 'token', accessToken: response.access_token });
        } else {
          resolve({ type: 'closed' });
        }
      },
    });
    client.requestAccessToken({ prompt: '' });
  });
}

/** Upload a file and make it publicly viewable. Returns the view link. */
export async function uploadToDrive(
  accessToken: string,
  fileName: string,
  blob: Blob,
  makePublic: boolean,
): Promise<ShareFileResult> {
  const metadata = { name: fileName };
  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
  );
  form.append('file', blob);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    },
  );
  if (!response.ok) {
    throw new ShareError('upload-failed', describeDriveError(response.status));
  }
  const { id } = (await response.json()) as { id?: string };
  if (!id) {
    throw new ShareError('upload-failed', 'Drive did not return a file id.');
  }

  if (makePublic) {
    const permission = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}/permissions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' }),
      },
    );
    if (!permission.ok) {
      throw new ShareError('share-failed', describeDriveError(permission.status));
    }
  }

  return { viewLink: buildDriveViewLink(id) };
}

/** https://drive.google.com/file/d/<id>/view */
export function buildDriveViewLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

/** Sanitize a user title into a safe file name (no path/control chars). */
export function titleToFileName(title: string, extension: string): string {
  const cleaned = title
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const base = cleaned.length > 0 ? cleaned : 'Untitled recording';
  return `${base}.${extension}`;
}

function describeDriveError(status: number): string {
  if (status === 401) {
    return 'Google rejected the session (401). Share again to sign in anew.';
  }
  if (status === 403) {
    return 'Google refused the upload (403). Check Drive storage space and the OAuth client settings.';
  }
  return `Google Drive returned an error (HTTP ${status}).`;
}
