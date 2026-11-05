import { formatElapsed } from '../ui/format';
import type { TranscriptSegment } from '../types';

/**
 * Render segments as an SRT subtitle file: numbered blocks with
 * HH:MM:SS,mmm timecodes, separated by blank lines.
 */
export function formatSrt(segments: TranscriptSegment[]): string {
  const blocks = segments.map((segment, index) => {
    const start = formatSrtTimecode(segment.startMs);
    const end = formatSrtTimecode(segment.endMs);
    return `${index + 1}\n${start} --> ${end}\n${segment.text}`;
  });
  return `${blocks.join('\n\n')}\n`;
}

/** Render segments as a plain-text transcript with timestamped lines. */
export function formatTranscript(segments: TranscriptSegment[]): string {
  const lines: string[] = ['Screen recording transcript', ''];
  for (const segment of segments) {
    lines.push(
      `[${formatElapsed(segment.startMs)} - ${formatElapsed(segment.endMs)}] ${segment.text}`,
    );
  }
  lines.push('');
  return lines.join('\n');
}

/** Format milliseconds as an SRT timecode: HH:MM:SS,mmm. */
export function formatSrtTimecode(ms: number): string {
  const total = Math.max(0, Math.round(ms));
  const milliseconds = total % 1000;
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / 60_000) % 60;
  const hours = Math.floor(total / 3_600_000);
  const mm = String(milliseconds).padStart(3, '0');
  const ss = String(seconds).padStart(2, '0');
  const mi = String(minutes).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  return `${hh}:${mi}:${ss},${mm}`;
}
