import { describe, expect, it } from 'vitest';
import { formatBytes, formatElapsed, formatMimeLabel } from '../../src/ui/format';

describe('formatElapsed', () => {
  it('formats minutes and seconds with padding', () => {
    expect(formatElapsed(0)).toBe('00:00');
    expect(formatElapsed(65_000)).toBe('01:05');
    expect(formatElapsed(3_599_000)).toBe('59:59');
  });

  it('switches to h:mm:ss at one hour', () => {
    expect(formatElapsed(3_600_000)).toBe('1:00:00');
    expect(formatElapsed(3_723_000)).toBe('1:02:03');
  });
});

describe('formatBytes', () => {
  it('formats bytes under 1 KB without decimals', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('uses binary units with one decimal', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('stops at the largest unit', () => {
    expect(formatBytes(1024 ** 5)).toBe('1024.0 TB');
  });

  it('never returns a negative value', () => {
    expect(formatBytes(-5)).toBe('0 B');
  });
});

describe('formatMimeLabel', () => {
  it('labels webm and mp4 containers', () => {
    expect(formatMimeLabel('video/webm;codecs=vp9,opus')).toBe('WebM');
    expect(formatMimeLabel('video/webm')).toBe('WebM');
    expect(formatMimeLabel('video/mp4')).toBe('MP4');
  });

  it('falls back to the container string for unknown types', () => {
    expect(formatMimeLabel('video/odd')).toBe('video/odd');
  });
});
