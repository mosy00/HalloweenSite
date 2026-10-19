import { defineConfig } from "vite";
import { resolve } from "path";

// root = src/ so the dev server serves src/index.html at "/" (was the 404 cause)
export default defineConfig({
  root: "src",
  publicDir: resolve(__dirname, "src/assets"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    open: true,
  },
});