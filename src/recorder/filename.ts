import { RECORDING_FILENAME_PREFIX } from '../config';

/**
 * Build a download filename like `screen-recording-20261106-142530.webm`
 * from local time.
 */
export function buildRecordingFilename(now: Date, fileExtension: string): string {
  return `${RECORDING_FILENAME_PREFIX}-${formatTimestamp(now)}.${fileExtension}`;
}

/**
 * Derive the file extension from a mime type: an exact match against the
 * configured format list first, then container inference as a fallback.
 */
export function extensionFromMime(mimeType: string): string {
  if (mimeType.includes('mp4')) {
    return 'mp4';
  }
  return 'webm';
}

/** Build the download filename for a transcript text file. */
export function buildTranscriptFilename(now: Date): string {
  return `${RECORDING_FILENAME_PREFIX}-transcript-${formatTimestamp(now)}.txt`;
}

/** Build the download filename for an SRT subtitles file. */
export function buildSrtFilename(now: Date): string {
  return `${RECORDING_FILENAME_PREFIX}-subtitles-${formatTimestamp(now)}.srt`;
}

function formatTimestamp(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
