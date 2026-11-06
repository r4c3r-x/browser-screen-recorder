import { test, expect } from '@playwright/test';
import fs from 'node:fs';

test('records, pauses, resumes, stops, and downloads a recording', async ({ page }) => {
  await page.goto('/');
  const startButton = page.getByRole('button', { name: 'Start recording' });
  await expect(startButton).toBeEnabled();

  // Idle state shows no status bar and no save controls: nothing exists yet.
  await expect(page.locator('#status')).toBeHidden();
  await expect(page.locator('#download')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Discard recording' })).toHaveCount(0);
  await expect(page.locator('#discard-hint')).toBeHidden();

  await startButton.click();

  const chip = page.locator('#state-chip');
  await expect(chip).toHaveText('Recording', { timeout: 10_000 });
  await expect(page.locator('#status')).toBeVisible();
  await expect(page.locator('#preview')).toBeVisible();
  await expect(page.locator('#mime')).toBeVisible();

  // Timer ticks while recording.
  await page.waitForTimeout(1500);
  const beforePause = await page.locator('#elapsed').textContent();
  expect(beforePause).not.toBe('00:00');

  // Timer freezes while paused.
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(chip).toHaveText('Paused');
  const pausedValue = await page.locator('#elapsed').textContent();
  await page.waitForTimeout(1200);
  expect(await page.locator('#elapsed').textContent()).toBe(pausedValue);

  // Timer continues after resume.
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(chip).toHaveText('Recording');

  // Size counter accumulates chunks.
  await page.waitForTimeout(1500);
  const sizeText = await page.locator('#size').textContent();
  expect(sizeText).not.toBe('0 B');

  // Stop produces a finished recording, then explicit download works.
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(chip).toHaveText('Finished');

  const downloadButton = page.getByRole('button', { name: 'Download recording' });
  await expect(downloadButton).toBeVisible();
  await expect(downloadButton).toBeEnabled();
  await expect(page.locator('#discard-hint')).toBeVisible();
  const downloadPromise = page.waitForEvent('download', { timeout: 20_000 });
  await downloadButton.click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(
    /^screen-recording-\d{8}-\d{6}\.(webm|mp4)$/,
  );
  const filePath = await download.path();
  expect(fs.statSync(filePath).size).toBeGreaterThan(0);

  // Transcription is only offered for mic recordings: this one had none.
  const transcribeButton = page.getByRole('button', { name: 'Transcribe recording' });
  await expect(transcribeButton).toBeHidden();

  // Record with the microphone and camera to unlock transcription.
  await page.getByLabel('Include microphone').check();
  await page.getByLabel('Include camera').check(); // fake device: exercises the compositor
  await page.getByRole('button', { name: 'Start recording' }).click();
  await expect(page.locator('#state-chip')).toHaveText('Recording', { timeout: 10_000 });
  await page.waitForTimeout(1300); // first timeslice guarantees a non-empty blob
  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.locator('#state-chip')).toHaveText('Finished');

  // Transcription controls: enabled after finish; clicking shows the
  // offline-model loading state (the 41 MB model download is not awaited
  // in tests).
  await expect(transcribeButton).toBeVisible();
  await expect(transcribeButton).toBeEnabled();
  await transcribeButton.click();
  await expect(page.locator('#transcript-status')).toBeVisible();
  await expect(page.locator('#transcript-status')).toContainText('model');

  // Playback: the finished recording is watchable in-app via native controls.
  const playbackVideo = page.locator('#playback');
  await expect(playbackVideo).toBeVisible();
  expect(await playbackVideo.getAttribute('src')).toMatch(/^blob:/);
  const duration = await playbackVideo.evaluate((element) => (element as HTMLVideoElement).duration);
  expect(duration).toBeGreaterThan(0);
  await expect(page.locator('#preview')).toBeHidden();

  // Discard is a reload: the browser asks for confirmation first.
  let beforeUnloadFired = false;
  page.on('dialog', (dialog) => {
    if (dialog.type() === 'beforeunload') {
      beforeUnloadFired = true;
      void dialog.accept();
    }
  });
  await page.reload();
  expect(beforeUnloadFired).toBe(true);

  // After the reload the session is idle again.
  await expect(page.locator('#download')).toBeHidden();
  await expect(page.locator('#discard-hint')).toBeHidden();
});

test('shows an error banner and recovers when screen permission is denied', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getDisplayMedia', {
      value: () =>
        Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
    });
  });
  const page = await context.newPage();
  await page.goto('/');

  await page.getByRole('button', { name: 'Start recording' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('permission was denied');

  // The session returns to idle: start is enabled again, no stuck state.
  await expect(page.getByRole('button', { name: 'Start recording' })).toBeEnabled();
  await alert.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);

  await context.close();
});

test('locks the recording UI upfront when screen capture is unavailable', async ({
  browser,
}) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    // Phones and in-app browsers: mediaDevices exists, getDisplayMedia does not.
    Object.defineProperty(MediaDevices.prototype, 'getDisplayMedia', {
      get: () => undefined,
      configurable: true,
    });
  });
  const page = await context.newPage();
  await page.goto('/');

  await expect(page.getByRole('button', { name: 'Start recording' })).toBeDisabled();
  await expect(page.getByLabel('Include microphone')).toBeDisabled();
  await expect(page.getByLabel('Include camera')).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText("isn't supported");

  await context.close();
});

test('records without microphone when mic access is denied', async ({ browser }) => {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: () =>
        Promise.reject(new DOMException('Mic denied', 'NotAllowedError')),
    });
  });
  const page = await context.newPage();
  await page.goto('/');

  await page.getByLabel('Include microphone').check();
  await page.getByRole('button', { name: 'Start recording' }).click();

  // Fail-soft: recording continues, with a visible notice.
  await expect(page.locator('#state-chip')).toHaveText('Recording', { timeout: 10_000 });
  await expect(page.locator('.banner-notice')).toContainText('Microphone unavailable');

  // Stop after the first timeslice (1 s) so the blob is guaranteed non-empty.
  await page.waitForTimeout(1300);

  await page.getByRole('button', { name: 'Stop recording' }).click();
  await expect(page.locator('#state-chip')).toHaveText('Finished');

  const downloadButton = page.getByRole('button', { name: 'Download recording' });
  await expect(downloadButton).toBeEnabled();
  const downloadPromise = page.waitForEvent('download', { timeout: 20_000 });
  await downloadButton.click();
  const download = await downloadPromise;
  expect(fs.statSync(await download.path()).size).toBeGreaterThan(0);

  await context.close();
});
