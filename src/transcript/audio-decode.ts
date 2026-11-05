import { TARGET_SAMPLE_RATE_HZ } from '../config';

/** Average all channels of an AudioBuffer into one mono channel. */
export function averageChannels(buffer: AudioBuffer): Float32Array {
  const channels = buffer.numberOfChannels;
  if (channels === 0) {
    return new Float32Array(0);
  }
  if (channels === 1) {
    return buffer.getChannelData(0).slice();
  }
  const mono = new Float32Array(buffer.length);
  for (let channel = 0; channel < channels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < mono.length; i += 1) {
      mono[i] = (mono[i] ?? 0) + (data[i] ?? 0) / channels;
    }
  }
  return mono;
}

/**
 * Linear-interpolation resampler. Pure and unit-tested; good enough for
 * speech (the models tolerate slight interpolation artifacts).
 */
export function resampleLinear(
  input: Float32Array,
  fromRate: number,
  toRate: number,
): Float32Array {
  if (input.length === 0 || fromRate === toRate) {
    return input.slice();
  }
  const outputLength = Math.max(0, Math.ceil((input.length * toRate) / fromRate));
  const output = new Float32Array(outputLength);
  const step = fromRate / toRate;
  for (let i = 0; i < outputLength; i += 1) {
    const position = i * step;
    const index = Math.floor(position);
    const fraction = position - index;
    const current = input[index] ?? 0;
    const next = input[index + 1] ?? current;
    output[i] = current + (next - current) * fraction;
  }
  return output;
}

/**
 * Decode a recording blob (WebM or MP4 container) to mono Float32 PCM at
 * the sample rate Whisper expects.
 */
export async function decodeRecordingToPcm16k(blob: Blob): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();
  const context = new AudioContext();
  try {
    const decoded = await context.decodeAudioData(arrayBuffer);
    const mono = averageChannels(decoded);
    return resampleLinear(mono, decoded.sampleRate, TARGET_SAMPLE_RATE_HZ);
  } finally {
    void context.close();
  }
}
