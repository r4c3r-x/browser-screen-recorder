import { describe, expect, it } from 'vitest';
import { canTransition } from '../../src/recorder/recording-session';

describe('canTransition', () => {
  it('allows the normal happy path', () => {
    expect(canTransition('idle', 'requesting')).toBe(true);
    expect(canTransition('requesting', 'recording')).toBe(true);
    expect(canTransition('recording', 'paused')).toBe(true);
    expect(canTransition('paused', 'recording')).toBe(true);
    expect(canTransition('recording', 'finished')).toBe(true);
    expect(canTransition('paused', 'finished')).toBe(true);
    expect(canTransition('finished', 'idle')).toBe(true);
    expect(canTransition('requesting', 'idle')).toBe(true); // start failed
  });

  it('rejects skipping the permission prompt', () => {
    expect(canTransition('idle', 'recording')).toBe(false);
    expect(canTransition('idle', 'finished')).toBe(false);
  });

  it('rejects recording from a finished session without reset', () => {
    expect(canTransition('finished', 'recording')).toBe(false);
  });

  it('rejects stop from idle or requesting', () => {
    expect(canTransition('idle', 'finished')).toBe(false);
  });

  it('rejects pausing an idle session', () => {
    expect(canTransition('idle', 'paused')).toBe(false);
  });
});
