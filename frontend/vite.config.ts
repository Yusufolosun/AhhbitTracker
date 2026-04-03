import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Custom Vite plugin to inject environment variables into index.html.
 *
 * Replaces %VITE_APP_URL% placeholders with the actual app URL,
 * falling back to the production URL if not set.
 */
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
  clearScreen: false,
  server: {
    port: 3000,
    strictPort: false,
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
    sourcemap: true,
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
        'src/main.tsx',
        'src/vite-env.d.ts',
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
