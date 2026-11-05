import { describe, expect, it } from 'vitest';
import { formatSrt, formatSrtTimecode, formatTranscript } from '../../src/transcript/srt';
import type { TranscriptSegment } from '../../src/types';

const SEGMENTS: TranscriptSegment[] = [
  { startMs: 0, endMs: 3500, text: 'Hello there.' },
  { startMs: 3_620_000, endMs: 3_623_456, text: 'Later words.' },
];

describe('formatSrtTimecode', () => {
  it('formats HH:MM:SS,mmm with zero padding', () => {
    expect(formatSrtTimecode(0)).toBe('00:00:00,000');
    expect(formatSrtTimecode(3_500)).toBe('00:00:03,500');
    expect(formatSrtTimecode(3_620_001)).toBe('01:00:20,001');
  });

  it('clamps negative values to zero', () => {
    expect(formatSrtTimecode(-5)).toBe('00:00:00,000');
  });

  it('rounds sub-millisecond values', () => {
    expect(formatSrtTimecode(1999.6)).toBe('00:00:02,000');
  });
});

describe('formatSrt', () => {
  it('produces numbered blocks with arrow timecodes and blank separators', () => {
    const srt = formatSrt(SEGMENTS);
    const blocks = srt.split('\n\n');
    expect(blocks[0]).toBe('1\n00:00:00,000 --> 00:00:03,500\nHello there.');
    expect(blocks[1]).toBe('2\n01:00:20,000 --> 01:00:23,456\nLater words.\n');
  });

  it('returns only a trailing newline for empty segments', () => {
    expect(formatSrt([])).toBe('\n');
  });
});

describe('formatTranscript', () => {
  it('writes a header and one timestamped line per segment', () => {
    const text = formatTranscript([{ startMs: 65_000, endMs: 66_000, text: 'Hi.' }]);
    expect(text).toContain('Screen recording transcript');
    expect(text).toContain('[01:05 - 01:06] Hi.');
  });
});
