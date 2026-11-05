import { describe, expect, it } from 'vitest';
import { encodeWav } from '../../src/transcript/wav-encoder';

describe('encodeWav', () => {
  it('writes a 44-byte header plus 2 bytes per sample', async () => {
    const blob = encodeWav(new Float32Array(100), 16_000);
    expect(blob.size).toBe(44 + 200);
    expect(blob.type).toBe('audio/wav');
  });

  it('writes RIFF/WAVE/fmt/data markers', async () => {
    const bytes = new Uint8Array(await encodeWav(new Float32Array(4), 16_000).arrayBuffer());
    const ascii = (offset: number, length: number) =>
      String.fromCharCode(...bytes.slice(offset, offset + length));
    expect(ascii(0, 4)).toBe('RIFF');
    expect(ascii(8, 4)).toBe('WAVE');
    expect(ascii(12, 4)).toBe('fmt ');
    expect(ascii(36, 4)).toBe('data');
  });

  it('records 16 kHz mono 16-bit PCM fields and clamps samples', async () => {
    const view = new DataView(
      await encodeWav(new Float32Array([0, 1, -1, 0.5]), 16_000).arrayBuffer(),
    );
    expect(view.getUint16(20, true)).toBe(1); // PCM format
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16_000); // sample rate
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(Math.round(view.getInt16(44 + 2, true))).toBe(32767); // clamped +1
    expect(Math.round(view.getInt16(44 + 4, true))).toBe(-32768); // clamped -1
  });
});
