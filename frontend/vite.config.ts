import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
});
