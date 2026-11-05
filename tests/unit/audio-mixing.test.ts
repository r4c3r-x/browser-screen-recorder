import { describe, expect, it } from 'vitest';
import {
  decideAudioMixingStrategy,
} from '../../src/recorder/audio-mixer';

describe('decideAudioMixingStrategy', () => {
  it('mixes when both system audio and mic are available', () => {
    expect(decideAudioMixingStrategy(true, true)).toBe('mix');
  });

  it('passes through when only system audio is available', () => {
    expect(decideAudioMixingStrategy(true, false)).toBe('passthrough');
  });

  it('passes through when only the mic is available (system audio absent in Firefox)', () => {
    expect(decideAudioMixingStrategy(false, true)).toBe('passthrough');
  });

  it('uses no audio when neither source is available', () => {
    expect(decideAudioMixingStrategy(false, false)).toBe('none');
  });
});
