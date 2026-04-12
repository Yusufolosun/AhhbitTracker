import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolveFrontendRuntimeConfig } from './src/utils/stacksConfig';

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
  const runtimeConfig = resolveFrontendRuntimeConfig({
    MODE: mode,
    DEV: mode !== 'production',
    VITE_APP_STAGE: env.VITE_APP_STAGE,
    VITE_STACKS_NETWORK: env.VITE_STACKS_NETWORK,
    VITE_STACKS_API_URL: env.VITE_STACKS_API_URL,
    VITE_CONTRACT_ADDRESS: env.VITE_CONTRACT_ADDRESS,
    VITE_CONTRACT_NAME: env.VITE_CONTRACT_NAME,
    VITE_APP_URL: env.VITE_APP_URL,
  });

  const appUrl = runtimeConfig.appUrl;
  const stacksApiUrl = runtimeConfig.stacksApiUrl;

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
