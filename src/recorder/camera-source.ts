/** A live camera capture: the video track and its teardown. */
export interface CameraSource {
  track: MediaStreamTrack;
  dispose(): void;
}

/**
 * Prompt for camera access and start capturing. Requests a modest size:
 * the bubble is small, so there is no reason to tax the device with 1080p.
 */
export async function requestCameraCapture(): Promise<CameraSource> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      facingMode: 'user',
    },
  });

  const track = stream.getVideoTracks()[0];
  if (!track) {
    stream.getTracks().forEach((t) => t.stop());
    throw new Error('Camera returned no video track.');
  }

  return {
    track,
    dispose() {
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}
