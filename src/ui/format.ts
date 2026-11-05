/** Human-readable formatting for status values. Pure functions. */

/** Format elapsed milliseconds as m:ss (or h:mm:ss at or above one hour). */
export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Format a byte count using binary units (1 KB = 1024 B). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${Math.max(0, Math.floor(bytes))} B`;
  }
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = -1;
  do {
    value /= 1024;
    unitIndex += 1;
  } while (value >= 1024 && unitIndex < units.length - 1);
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/** Short container label for a mime type (e.g. "WebM"), for a badge. */
export function formatMimeLabel(mimeType: string): string {
  const container = mimeType.split(';')[0]?.trim() ?? '';
  if (container.endsWith('/webm')) {
    return 'WebM';
  }
  if (container.endsWith('/mp4')) {
    return 'MP4';
  }
  return container || 'Unknown format';
}
