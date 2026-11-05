import { describe, expect, it } from 'vitest';
import { chooseRecordingFormat } from '../../src/recorder/media-recorder';
import type { RecordingFormat } from '../../src/types';

const FORMATS: RecordingFormat[] = [
  { mimeType: 'video/webm;codecs=vp9,opus', fileExtension: 'webm' },
  { mimeType: 'video/webm;codecs=vp8,opus', fileExtension: 'webm' },
  { mimeType: 'video/webm', fileExtension: 'webm' },
  { mimeType: 'video/mp4', fileExtension: 'mp4' },
];

describe('chooseRecordingFormat', () => {
  it('returns the first supported format in preference order', () => {
    const chosen = chooseRecordingFormat(
      (mime) => mime === 'video/webm;codecs=vp8,opus',
      FORMATS,
    );
    expect(chosen?.mimeType).toBe('video/webm;codecs=vp8,opus');
    expect(chosen?.fileExtension).toBe('webm');
  });

  it('prefers vp9 when everything is supported', () => {
    const chosen = chooseRecordingFormat(() => true, FORMATS);
    expect(chosen?.mimeType).toBe('video/webm;codecs=vp9,opus');
  });

  it('falls back to mp4 when webm is absent (Safari)', () => {
    const chosen = chooseRecordingFormat((mime) => mime === 'video/mp4', FORMATS);
    expect(chosen?.mimeType).toBe('video/mp4');
    expect(chosen?.fileExtension).toBe('mp4');
  });

  it('returns null when no format is supported', () => {
    const chosen = chooseRecordingFormat(() => false, FORMATS);
    expect(chosen).toBeNull();
  });

  it('returns null for an empty format list', () => {
    const chosen = chooseRecordingFormat(() => true, []);
    expect(chosen).toBeNull();
  });
});
