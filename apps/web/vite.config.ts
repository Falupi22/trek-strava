import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.VITE_API_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
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
