// One-off pipeline verification: real model download + Kaldi inference in a
// real Chromium. Not part of the test suite (the 41 MB model download is
// only acceptable as an explicit, rare check). Run with the dev server up:
//   node scripts/verify-vosk-pipeline.mjs
import { chromium } from '@playwright/test';

const context = await chromium.launchPersistentContext('.vosk-cache', {
  args: [
    '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream',
    '--auto-select-desktop-capture-source=Entire screen',
  ],
});
const page = context.pages()[0] ?? (await context.newPage());
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    console.log(`[browser ${message.type()}] ${message.text()}`);
  }
});
page.on('pageerror', (error) => console.log(`[pageerror] ${error.message}`));
await page.goto('http://localhost:5173/');

await page.getByRole('button', { name: 'Start recording' }).click();
await page.locator('#state-chip').filter({ hasText: 'Recording' }).waitFor({ timeout: 15000 });
await page.waitForTimeout(3000);
await page.getByRole('button', { name: 'Stop recording' }).click();
await page.locator('#state-chip').filter({ hasText: 'Finished' }).waitFor({ timeout: 15000 });

console.log('recording done, starting transcription (model download may take minutes)…');
await page.getByRole('button', { name: 'Transcribe recording' }).click();

// Report every status transition until a terminal one appears.
let last = '';
const deadline = Date.now() + 6 * 60_000;
for (;;) {
  if (Date.now() > deadline) {
    console.log('FAIL: timed out waiting for a terminal transcript state');
    process.exit(1);
  }
  const status = await page.locator('#transcript-status').textContent();
  if (status !== last) {
    console.log(`status: ${status}`);
    last = status;
  }
  if (status?.includes('Transcript ready') || status?.includes('No speech detected')) {
    console.log(`PASS: pipeline completed -> "${status}"`);
    const chip = await page.locator('#state-chip').textContent();
    console.log(`session state: ${chip}`);
    break;
  }
  if (status?.includes('failed')) {
    const banner = await page.locator('.banner-text').allTextContents();
    console.log('FAIL: transcript status reports failure');
    console.log(`banner: ${JSON.stringify(banner)}`);
    process.exit(1);
  }
  await page.waitForTimeout(1000);
}

await context.close();
