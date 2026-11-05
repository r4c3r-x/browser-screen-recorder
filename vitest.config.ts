import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Unit tests only: the Playwright e2e suite (*.spec.ts) runs via
    // `npm run test:e2e` and must not be picked up here.
    include: ['tests/unit/**/*.test.ts'],
  },
});
