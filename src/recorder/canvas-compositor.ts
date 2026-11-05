import {
  WEBCAM_BUBBLE_MARGIN_PX,
  WEBCAM_BUBBLE_WIDTH_RATIO,
  WEBCAM_FRAME_RATE,
} from '../config';

/** Bubble geometry inside the capture frame, in px. */
export interface BubbleLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Compute the bottom-right bubble rect for a given camera aspect. Pure. */
export function layoutBubble(
  canvasWidth: number,
  canvasHeight: number,
  cameraWidth: number,
  cameraHeight: number,
): BubbleLayout {
  const w = Math.round(canvasWidth * WEBCAM_BUBBLE_WIDTH_RATIO);
  const h = cameraWidth > 0 ? Math.round((w * cameraHeight) / cameraWidth) : Math.round((w * 3) / 4);
  return {
    x: canvasWidth - w - WEBCAM_BUBBLE_MARGIN_PX,
    y: canvasHeight - h - WEBCAM_BUBBLE_MARGIN_PX,
    w,
    h,
  };
}

/** A composited video stream (screen + camera bubble) and its teardown. */
export interface Compositor {
  canvasStream: MediaStream;
  stop(): void;
}

/**
 * Draw the screen capture with a mirrored camera bubble on a canvas and
 * stream the canvas as the recorded video. Drawing is driven by a Worker
 * timer on purpose: requestAnimationFrame freezes in hidden tabs (a screen
 * recorder spends its life hidden) and background page timers throttle to
 * ~1 fps, while a Worker keeps ticking at full rate.
 */
export async function createCanvasCompositor(
  screenStream: MediaStream,
  cameraTrack: MediaStreamTrack,
): Promise<Compositor> {
  const screenVideo = createVideoElement(screenStream);
  const cameraVideo = createVideoElement(new MediaStream([cameraTrack]));
  await Promise.all([waitForVideo(screenVideo), waitForVideo(cameraVideo)]);

  const canvas = document.createElement('canvas');
  canvas.width = screenVideo.videoWidth;
  canvas.height = screenVideo.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable.');
  }

  const canvasStream = canvas.captureStream(WEBCAM_FRAME_RATE);
  const draw = () => {
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);
    drawBubble(ctx, cameraVideo, layoutBubble(canvas.width, canvas.height, cameraVideo.videoWidth, cameraVideo.videoHeight));
  };

  const ticker = createTickWorker(WEBCAM_FRAME_RATE);
  ticker.onmessage = draw;
  draw();

  return {
    canvasStream,
    stop() {
      ticker.terminate();
      screenVideo.srcObject = null;
      cameraVideo.srcObject = null;
      canvasStream.getTracks().forEach((track) => track.stop());
    },
  };
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  cameraVideo: HTMLVideoElement,
  layout: BubbleLayout,
): void {
  ctx.save();
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(layout.x, layout.y, layout.w, layout.h, 12);
  } else {
    ctx.rect(layout.x, layout.y, layout.w, layout.h);
  }
  ctx.clip();
  // Mirror horizontally: selfie view is what users expect of a camera bubble.
  ctx.translate(layout.x + layout.w, layout.y);
  ctx.scale(-1, 1);
  ctx.drawImage(cameraVideo, 0, 0, layout.w, layout.h);
  ctx.restore();
}

function createVideoElement(stream: MediaStream): HTMLVideoElement {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.srcObject = stream;
  void video.play();
  return video;
}

function waitForVideo(video: HTMLVideoElement): Promise<void> {
  if (video.videoWidth > 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    video.addEventListener('loadedmetadata', () => resolve(), { once: true });
  });
}

function createTickWorker(fps: number): Worker {
  const source = `setInterval(() => postMessage(0), ${Math.round(1000 / fps)});`;
  const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
  return new Worker(url);
}
