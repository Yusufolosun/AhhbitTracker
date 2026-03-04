/**
 * dev.mjs — Vite dev-server bootstrap
 *
 * Replaces the `vite` CLI call in `npm run dev` to work around a
 * MinTTY / Git Bash issue on Windows where the Vite CLI calls
 * `process.stdin.setRawMode()`.  MinTTY does not implement the Windows
 * Console API, so stdin immediately returns EOF, which triggers Vite's
 * internal `readline.close()` → `process.exit()` path.  The process
 * exits silently before the banner is printed.
 *
 * Using the Node API (`createServer`) bypasses the CLI's stdin listener
 * entirely, making `npm run dev` work correctly in every terminal:
 *   • Git Bash / MinTTY  (Windows)
 *   • Windows Terminal   (PowerShell / CMD)
 *   • macOS / Linux      (iTerm, gnome-terminal, …)
 *
 * Ctrl-C still shuts the server down cleanly via the SIGINT handler.
 */

import { createServer } from 'vite';

const server = await createServer();
await server.listen();
server.printUrls();

// Keep the process alive and shut down cleanly on Ctrl-C.
process.on('SIGINT', async () => {
  await server.close();
  process.exit(0);
});
