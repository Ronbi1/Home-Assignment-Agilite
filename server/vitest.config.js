import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup/env.setup.js', 'tests/setup/external.setup.js', 'tests/setup/db.setup.js'],
    restoreMocks: true,
    clearMocks: true,
  },
});
