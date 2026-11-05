/**
 * Encode mono Float32 PCM as a 16-bit PCM WAV file. Pure and unit-tested.
 * Rationale for WAV: universally accepted by transcription APIs and it
 * carries only the audio track (the recording's video is never uploaded).
 */

const BITS_PER_SAMPLE = 16;
const PCM_FORMAT_CODE = 1;
const HEADER_BYTES = 44;

export function encodeWav(pcm: Float32Array, sampleRate: number): Blob {
  const dataBytes = pcm.length * (BITS_PER_SAMPLE / 8);
  const buffer = new ArrayBuffer(HEADER_BYTES + dataBytes);
  const view = new DataView(buffer);

  writeWavHeader(view, sampleRate, pcm.length);
  writePcmSamples(view, pcm);

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeWavHeader(
  view: DataView,
  sampleRate: number,
  sampleCount: number,
): void {
  const dataBytes = sampleCount * (BITS_PER_SAMPLE / 8);
  const blockAlign = 1; // mono
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, PCM_FORMAT_CODE, true);
  view.setUint16(22, 1, true); // mono channel count
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign * (BITS_PER_SAMPLE / 8), true); // byte rate
  view.setUint16(32, blockAlign * (BITS_PER_SAMPLE / 8), true); // block align
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataBytes, true);
}

function writePcmSamples(view: DataView, pcm: Float32Array): void {
  let offset = HEADER_BYTES;
  for (let i = 0; i < pcm.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, pcm[i] ?? 0));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += BITS_PER_SAMPLE / 8;
  }
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i += 1) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
