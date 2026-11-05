import { describe, expect, it } from 'vitest';
import {
  buildRecordingFilename,
  buildSrtFilename,
  buildTranscriptFilename,
} from '../../src/recorder/filename';

describe('buildRecordingFilename', () => {
  it('formats local date and time with zero padding', () => {
    const date = new Date(2026, 10, 6, 8, 5, 3); // Nov 6 2026, 08:05:03 local
    expect(buildRecordingFilename(date, 'webm')).toBe(
      'screen-recording-20261106-080503.webm',
    );
  });

  it('uses the extension it is given', () => {
    const date = new Date(2026, 0, 31, 23, 59, 59);
    expect(buildRecordingFilename(date, 'mp4')).toBe(
      'screen-recording-20260131-235959.mp4',
    );
  });

  it('pads single-digit months and days', () => {
    const date = new Date(2026, 2, 1, 0, 0, 0);
    expect(buildRecordingFilename(date, 'webm')).toContain('20260301-000000');
  });
});

describe('transcript and srt filenames', () => {
  it('suffixes transcript and subtitles files with .txt/.srt', () => {
    const date = new Date(2026, 10, 6, 8, 5, 3);
    expect(buildTranscriptFilename(date)).toBe('screen-recording-transcript-20261106-080503.txt');
    expect(buildSrtFilename(date)).toBe('screen-recording-subtitles-20261106-080503.srt');
  });
});
