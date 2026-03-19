import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function htmlEnvPlugin(): Plugin {
  return {
    name: 'html-env-fallback',
    transformIndexHtml(html) {
      const appUrl = process.env.VITE_APP_URL || 'https://ahhbit-tracker.vercel.app';
      return html.replace(/%VITE_APP_URL%/g, appUrl);
    },
  };
}

export default defineConfig({
  plugins: [react(), htmlEnvPlugin()],
  // Prevent Vite from clearing the terminal on startup.
  // Without this, the "Local: http://localhost:…" URL disappears on
  // Windows terminals (Git Bash / MINGW64) because the ANSI clear-screen
  // sequence is emitted before the URL and the TTY re-renders the prompt.
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: false,   // fall back to next free port instead of crashing
    host: 'localhost',
    proxy: {
      '/api/stacks': {
        target: process.env.VITE_STACKS_API_URL || 'https://api.mainnet.hiro.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stacks/, ''),
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    modulePreload: { polyfill: false },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/dist/**',
        'src/main.tsx', // Entry point, hard to test
        'src/vite-env.d.ts', // Type definitions
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
