import { afterEach, describe, expect, it, vi } from 'vitest';
import { isScreenCaptureSupported } from '../../src/recorder/capture-source';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isScreenCaptureSupported', () => {
  it('is true when getDisplayMedia exists', () => {
    vi.stubGlobal(
      'navigator',
      { mediaDevices: { getDisplayMedia: () => undefined } },
    );
    expect(isScreenCaptureSupported()).toBe(true);
  });

  it('is false when mediaDevices lacks getDisplayMedia (mobile, in-app browsers)', () => {
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => undefined } });
    expect(isScreenCaptureSupported()).toBe(false);
  });

  it('is false when mediaDevices is missing entirely', () => {
    vi.stubGlobal('navigator', {});
    expect(isScreenCaptureSupported()).toBe(false);
  });

  it('is false when navigator is absent (non-browser runtimes)', () => {
    vi.stubGlobal('navigator', undefined);
    expect(isScreenCaptureSupported()).toBe(false);
  });
});
