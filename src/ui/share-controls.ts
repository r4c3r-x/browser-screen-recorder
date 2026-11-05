import type { SharePhase } from '../share/drive-client';

export interface ShareControlHandlers {
  onShare(): void;
  onUpload(title: string, includeTranscript: boolean): void;
  onCancel(): void;
}

export interface ShareControls {
  update(state: {
    sessionFinished: boolean;
    hasResult: boolean;
    phase: SharePhase;
    hasTranscript: boolean;
    shareLink: string | null;
    hasClientId: boolean;
  }): void;
}

export function createShareControls(handlers: ShareControlHandlers): ShareControls {
  const share = requireButton('share');
  const shareLink = requireLink('share-link');
  const form = requireElement('share-form');
  const setup = requireElement('drive-setup');
  const title = requireInput('share-title');
  const includeTranscript = requireInput('share-include-transcript');
  const upload = requireButton('share-upload');
  const cancel = requireButton('share-cancel');

  share.addEventListener('click', () => handlers.onShare());
  upload.addEventListener('click', () => handlers.onUpload(title.value, includeTranscript.checked));
  cancel.addEventListener('click', () => handlers.onCancel());
  includeTranscript.disabled = true;

  return { update };

  function update(state: {
    sessionFinished: boolean;
    hasResult: boolean;
    phase: SharePhase;
    hasTranscript: boolean;
    shareLink: string | null;
    hasClientId: boolean;
  }): void {
    const finishedShareable = state.sessionFinished && state.hasResult;
    share.hidden = !finishedShareable;
    share.disabled = state.phase === 'login' || state.phase === 'uploading';
    share.textContent = state.shareLink !== null ? 'Share again' : 'Share recording';

    // Setup field shows when sharing was attempted without a client ID.
    const needsSetup = state.phase === 'title' && !state.hasClientId;
    setup.hidden = !needsSetup;

    // The title form shows once signed in (or whenever sharing is in the
    // title phase with a client ID present).
    form.hidden = state.phase !== 'title' || !state.hasClientId;
    includeTranscript.disabled = !state.hasTranscript;
    upload.disabled = title.value.trim().length === 0;

    if (state.shareLink !== null) {
      shareLink.hidden = false;
      shareLink.href = state.shareLink;
      shareLink.textContent = 'Shared: open in Google Drive';
    } else {
      shareLink.hidden = true;
      shareLink.removeAttribute('href');
      shareLink.textContent = '';
    }
  }

  function requireButton(id: string): HTMLButtonElement {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLButtonElement)) {
      throw new Error(`Required button #${id} is missing from index.html.`);
    }
    return element;
  }

  function requireInput(id: string): HTMLInputElement {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLInputElement)) {
      throw new Error(`Required input #${id} is missing from index.html.`);
    }
    return element;
  }

  function requireLink(id: string): HTMLAnchorElement {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLAnchorElement)) {
      throw new Error(`Required link #${id} is missing from index.html.`);
    }
    return element;
  }

  function requireElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Required element #${id} is missing from index.html.`);
    }
    return element;
  }
}
