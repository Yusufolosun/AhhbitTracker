import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function getStage(mode: string, rawStage: string | undefined): 'development' | 'staging' | 'production' {
  const normalized = rawStage?.trim().toLowerCase();
  if (normalized === 'development' || normalized === 'staging' || normalized === 'production') {
    return normalized;
  }

  if (mode === 'staging') {
    return 'staging';
  }

  return mode === 'production' ? 'production' : 'development';
}

function getDefaultAppUrl(stage: 'development' | 'staging' | 'production'): string {
  if (stage === 'staging') return 'https://staging.ahhbittracker.app';
  if (stage === 'production') return 'https://ahhbit-tracker.vercel.app';
  return 'http://localhost:3000';
}

function getDefaultStacksApiUrl(stage: 'development' | 'staging' | 'production'): string {
  return stage === 'production' ? 'https://api.mainnet.hiro.so' : 'https://api.testnet.hiro.so';
}

/**
 * Custom Vite plugin to inject environment variables into index.html.
 *
 * Replaces %VITE_APP_URL% placeholders with the actual app URL,
 * falling back to the production URL if not set.
 */
function htmlEnvPlugin(appUrl: string): Plugin {
  return {
    name: 'html-env-fallback',
    transformIndexHtml(html) {
      return html.replace(/%VITE_APP_URL%/g, appUrl);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const stage = getStage(mode, env.VITE_APP_STAGE);
  const appUrl = env.VITE_APP_URL || getDefaultAppUrl(stage);
  const stacksApiUrl = env.VITE_STACKS_API_URL || getDefaultStacksApiUrl(stage);

  return {
    plugins: [react(), htmlEnvPlugin(appUrl)],
    clearScreen: false,
    server: {
      port: 3000,
      strictPort: false,
      host: 'localhost',
      proxy: {
        '/api/stacks': {
          target: stacksApiUrl,
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
  };
});
