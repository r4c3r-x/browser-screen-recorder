/**
 * Tracks recording time excluding paused spans. All methods take `now` so
 * the logic stays pure and testable; the session feeds it timestamps.
 */
export interface ElapsedTracker {
  /** Record a pause start. Idempotent while already paused. */
  pause(now: number): void;
  /** Record a resume. Ignored when not paused. */
  resume(now: number): void;
  /** Elapsed recording time in ms, excluding paused spans. Never negative. */
  elapsedMs(now: number): number;
}

export function createElapsedTracker(startedAt: number): ElapsedTracker {
  let accumulatedActiveMs = 0;
  let pausedAt: number | null = null;

  return {
    pause(now) {
      if (pausedAt === null) {
        pausedAt = now;
      }
    },
    resume(now) {
      if (pausedAt !== null) {
        accumulatedActiveMs += now - pausedAt;
        pausedAt = null;
      }
    },
    elapsedMs(now) {
      const pausedMs =
        pausedAt !== null ? accumulatedActiveMs + (now - pausedAt) : accumulatedActiveMs;
      return Math.max(0, now - startedAt - pausedMs);
    },
  };
}
