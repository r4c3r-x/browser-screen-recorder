import {
  TRANSCRIPT_MAX_SEGMENT_CHARS,
  TRANSCRIPT_MAX_SEGMENT_SECONDS,
  TRANSCRIPT_MAX_WORD_GAP_SECONDS,
} from '../config';
import type { TranscriptSegment } from '../types';

/** One recognized word from the Vosk engine (times in seconds). */
export interface RecognizedWord {
  conf: number;
  start: number;
  end: number;
  word: string;
}

/**
 * Group recognized words into subtitle-sized segments. A new segment starts
 * when the current one exceeds the duration or character budget, when the
 * speaker pauses, or right after sentence-ending punctuation.
 */
export function groupWordsIntoSegments(words: RecognizedWord[]): TranscriptSegment[] {
  return splitIntoGroups(words)
    .map((group) => {
      const first = group[0];
      const last = group[group.length - 1];
      if (!first || !last) {
        return null;
      }
      return {
        startMs: Math.round(first.start * 1000),
        endMs: Math.round(last.end * 1000),
        text: group.map((word) => word.word).join(' '),
      };
    })
    .filter((segment): segment is TranscriptSegment => segment !== null);
}

function splitIntoGroups(words: RecognizedWord[]): RecognizedWord[][] {
  const groups: RecognizedWord[][] = [];
  let current: RecognizedWord[] = [];

  for (const word of words) {
    if (current.length > 0 && shouldBreakBefore(current, word)) {
      groups.push(current);
      current = [];
    }
    current.push(word);
    if (/[.!?]$/.test(word.word)) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length > 0) {
    groups.push(current);
  }
  return groups;
}

function shouldBreakBefore(current: RecognizedWord[], next: RecognizedWord): boolean {
  const last = current[current.length - 1];
  const first = current[0];
  if (!last || !first) {
    return false;
  }
  const gapMs = (next.start - last.end) * 1000;
  if (gapMs > TRANSCRIPT_MAX_WORD_GAP_SECONDS * 1000) {
    return true;
  }
  const durationMs = (next.end - first.start) * 1000;
  if (durationMs > TRANSCRIPT_MAX_SEGMENT_SECONDS * 1000) {
    return true;
  }
  const charCount =
    current.reduce((count, word) => count + word.word.length + 1, 0) + next.word.length;
  return charCount > TRANSCRIPT_MAX_SEGMENT_CHARS;
}
