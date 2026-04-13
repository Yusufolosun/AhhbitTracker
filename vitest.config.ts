import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from 'node:url';
import {
  vitestSetupFilePath,
  getClarinetVitestsArgv,
} from "@stacks/clarinet-sdk/vitest";

/**
 * Vitest configuration for Clarity smart contract tests.
 *
 * This config sets up the Clarinet testing environment for running
 * Clarity tests against a simulated blockchain (Simnet).
 *
 * The `vitest-environment-clarinet` will initialize the clarinet-sdk
 * and make the `simnet` object available globally in the test files.
 *
 * `vitestSetupFilePath` points to a file in the `@stacks/clarinet-sdk` package that:
 *   - Runs `before` hooks to initialize the simnet
 *   - Runs `after` hooks to collect costs and coverage reports
 *   - Loads custom vitest matchers for Clarity values (e.g., `expect(...).toBeUint()`)
 *
 * The `getClarinetVitestsArgv()` parses CLI options:
 *   - vitest run -- --manifest ./Clarinet.toml  # custom manifest path
 *   - vitest run -- --coverage --costs          # collect reports
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./mobile/src', import.meta.url)),
    },
  },
  test: {
    environment: "clarinet",
    pool: "forks",
    isolate: true,
    setupFiles: [
      vitestSetupFilePath,
    ],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
      },
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      'frontend/src/__tests__/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      include: [
        'contracts/**/*.clar',
      ],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**',
        'frontend/**',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
});
