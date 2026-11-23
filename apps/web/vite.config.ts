import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.VITE_API_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // In Docker on Windows/macOS, bind-mounted files don't emit change events
    // inside the container, so edits are never picked up. Poll instead.
    watch: process.env.CHOKIDAR_USEPOLLING ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      "/auth": {
        target: apiTarget,
        changeOrigin: false,
        followRedirects: false,
      },
      "/api/": { target: apiTarget, changeOrigin: false },
    },
  },
});
