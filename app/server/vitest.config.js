import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    globalSetup: ['./tests/globalSetup.js'],
    globalTeardown: ['./tests/globalTeardown.js'],
    include: ['tests/**/*.test.js'],
    fileParallelism: false,
    singleThread: true,
    testTimeout: 60000,
    hookTimeout: 120000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['routes/**', 'middleware/**', 'utils/**'],
      exclude: ['tests/**', 'seed/**']
    }
  }
})
