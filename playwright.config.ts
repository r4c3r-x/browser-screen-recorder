import { defineConfig } from '@playwright/test';
import { SERVER_PORT } from './src/config';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    headless: true,
    launchOptions: {
      args: [
        // Auto-accept permission prompts and supply synthetic media.
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        // Auto-pick the whole-screen source for getDisplayMedia.
        '--auto-select-desktop-capture-source=Entire screen',
      ],
    },
  },
  webServer: {
    command: 'npm run dev',
    port: SERVER_PORT,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
