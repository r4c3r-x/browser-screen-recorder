import { describe, expect, it } from 'vitest';
import { layoutBubble } from '../../src/recorder/canvas-compositor';

describe('layoutBubble', () => {
  it('places a 1080p camera bubble in the bottom-right corner', () => {
    const layout = layoutBubble(1920, 1080, 640, 480);
    expect(layout.w).toBe(Math.round(1920 * 0.22)); // 422
    expect(layout.h).toBe(Math.round((422 * 480) / 640)); // 4:3 kept
    expect(layout.x + layout.w).toBeLessThanOrEqual(1920);
    expect(layout.y + layout.h).toBeLessThanOrEqual(1080);
  });

  it('keeps the camera aspect ratio for widescreen cameras', () => {
    const layout = layoutBubble(1920, 1080, 1280, 720);
    expect(layout.h).toBe(Math.round((layout.w * 720) / 1280));
  });

  it('falls back to 4:3 when camera dimensions are unknown', () => {
    const layout = layoutBubble(1920, 1080, 0, 0);
    expect(layout.h).toBe(Math.round((layout.w * 3) / 4));
  });
});
