import { describe, expect, it } from 'vitest';
import { DEFAULT_QUALITY, QUALITY_PRESETS } from '../../src/config';

describe('QUALITY_PRESETS', () => {
  it('exposes the three presets with the default balanced', () => {
    expect(Object.keys(QUALITY_PRESETS).sort()).toEqual(['balanced', 'compact', 'crisp']);
    expect(DEFAULT_QUALITY).toBe('balanced');
  });

  it('uses positive bitrates ordered compact < balanced < crisp', () => {
    const video = Object.values(QUALITY_PRESETS).map((p) => p.videoBitsPerSecond);
    const audio = Object.values(QUALITY_PRESETS).map((p) => p.audioBitsPerSecond);
    expect(video.every((bps) => bps > 0)).toBe(true);
    expect(audio.every((bps) => bps > 0)).toBe(true);
    expect(video[0]).toBeLessThan(video[1]);
    expect(video[1]).toBeLessThan(video[2]);
  });
});
