import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function htmlEnvPlugin(): Plugin {
  return {
    name: 'html-env-fallback',
    transformIndexHtml(html) {
      const appUrl = process.env.VITE_APP_URL || 'https://ahhbittracker.vercel.app';
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
        target: 'https://api.mainnet.hiro.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stacks/, ''),
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
