import { describe, expect, it } from 'vitest';
import { createElapsedTracker } from '../../src/recorder/elapsed-time';

describe('createElapsedTracker', () => {
  it('counts elapsed time when never paused', () => {
    const tracker = createElapsedTracker(1000);
    expect(tracker.elapsedMs(4000)).toBe(3000);
  });

  it('excludes paused spans from elapsed time', () => {
    const tracker = createElapsedTracker(0);
    tracker.pause(1000);
    tracker.resume(3000); // 2s paused
    expect(tracker.elapsedMs(4000)).toBe(2000); // 4s wall, 2s active
  });

  it('freezes elapsed time while paused', () => {
    const tracker = createElapsedTracker(0);
    tracker.pause(1000);
    expect(tracker.elapsedMs(2000)).toBe(1000);
    expect(tracker.elapsedMs(10000)).toBe(1000); // still paused, no growth
  });

  it('accumulates multiple pause spans', () => {
    const tracker = createElapsedTracker(0);
    tracker.pause(1000);
    tracker.resume(2000); // 1s paused
    tracker.pause(5000);
    tracker.resume(7000); // 2s paused
    expect(tracker.elapsedMs(8000)).toBe(5000); // 8s wall, 3s paused
  });

  it('ignores pause while already paused', () => {
    const tracker = createElapsedTracker(0);
    tracker.pause(1000);
    tracker.pause(5000); // second pause must not extend the span
    tracker.resume(6000);
    expect(tracker.elapsedMs(7000)).toBe(2000); // 1s active before pause + 1s after
  });

  it('ignores resume when not paused', () => {
    const tracker = createElapsedTracker(0);
    tracker.resume(3000);
    expect(tracker.elapsedMs(3000)).toBe(3000);
  });

  it('never returns a negative elapsed time', () => {
    const tracker = createElapsedTracker(1000);
    expect(tracker.elapsedMs(0)).toBe(0);
  });
});
