/**
 * Audio combining for recordings. A single source needs no mixing: it is
 * passed through untouched, avoiding an AudioContext entirely. Mixing (and
 * the context lifecycle that comes with it) only happens for two sources.
 */
export type AudioMixingStrategy = 'none' | 'passthrough' | 'mix';

/** Decide the strategy from available sources. Pure and unit-tested. */
export function decideAudioMixingStrategy(
  hasSystemAudio: boolean,
  hasMic: boolean,
): AudioMixingStrategy {
  if (hasSystemAudio && hasMic) {
    return 'mix';
  }
  if (hasSystemAudio || hasMic) {
    return 'passthrough';
  }
  return 'none';
}

/** A combined audio track and the teardown for any mixing resources. */
export interface MixedAudio {
  track: MediaStreamTrack | null;
  /** Disconnect sources and close the AudioContext if one was created. */
  stop(): void;
}

/**
 * Combine the system-audio and microphone tracks into one track according
 * to the decided strategy. Both gains are 1.0 (levels are the user's to
 * control at the OS level). Never throws for missing sources: returns a
 * null track when there is no audio.
 */
export function createMixedAudio(
  systemAudioTrack: MediaStreamTrack | null,
  micTrack: MediaStreamTrack | null,
): MixedAudio {
  const strategy = decideAudioMixingStrategy(
    systemAudioTrack !== null,
    micTrack !== null,
  );

  if (strategy === 'none') {
    return { track: null, stop: () => undefined };
  }
  if (strategy === 'passthrough') {
    const track = systemAudioTrack ?? micTrack;
    return { track, stop: () => undefined };
  }

  return mixTwoSources(systemAudioTrack, micTrack);
}

/**
 * Build the AudioContext graph: two MediaStreamAudioSourceNodes into gain
 * nodes, into a single MediaStreamAudioDestinationNode. stop() closes the
 * context; the browser then reclaims the mixed track.
 */
function mixTwoSources(
  systemAudioTrack: MediaStreamTrack | null,
  micTrack: MediaStreamTrack | null,
): MixedAudio {
  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();

  const systemSource =
    systemAudioTrack !== null ? context.createMediaStreamSource(new MediaStream([systemAudioTrack])) : null;
  const micSource =
    micTrack !== null ? context.createMediaStreamSource(new MediaStream([micTrack])) : null;

  systemSource?.connect(destination);
  micSource?.connect(destination);

  const track = destination.stream.getAudioTracks()[0] ?? null;

  return {
    track,
    stop() {
      systemSource?.disconnect();
      micSource?.disconnect();
      void context.close();
    },
  };
}
