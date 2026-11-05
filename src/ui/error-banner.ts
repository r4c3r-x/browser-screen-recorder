export interface ErrorBanner {
  /** Show an error (assertive, red). Replaces any visible message. */
  showError(message: string): void;
  /** Show a non-fatal notice (polite, neutral). Replaces any message. */
  showNotice(message: string): void;
  clear(): void;
}

/**
 * Renders a single dismissible message into the given region. One message
 * at a time: a new message replaces the previous one, so the region never
 * stacks stale errors.
 */
export function createErrorBanner(region: HTMLElement): ErrorBanner {
  let current: HTMLElement | null = null;

  function show(message: string, kind: 'error' | 'notice', role: 'alert' | 'status'): void {
    clear();
    const banner = document.createElement('div');
    banner.className = `banner banner-${kind}`;
    banner.setAttribute('role', role);

    const text = document.createElement('p');
    text.className = 'banner-text';
    text.textContent = message;

    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'banner-dismiss';
    dismiss.textContent = 'Dismiss';
    dismiss.addEventListener('click', clear);

    banner.append(text, dismiss);
    region.append(banner);
    current = banner;
  }

  function clear(): void {
    current?.remove();
    current = null;
  }

  return {
    showError: (message) => show(message, 'error', 'alert'),
    showNotice: (message) => show(message, 'notice', 'status'),
    clear,
  };
}
