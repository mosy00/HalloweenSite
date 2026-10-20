import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const rootDir = dirname(fileURLToPath(import.meta.url));

// root = src/ so the dev server serves src/index.html at "/" (was the 404 cause)
export default defineConfig({
  root: resolve(rootDir, "src"),
  // Relative asset URLs so the build works at a domain root AND in a
  // subdirectory (e.g. example.com/halloween/) on plain static hosting.
  base: "./",
  publicDir: resolve(rootDir, "src/assets"),
  build: {
    outDir: resolve(rootDir, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    open: true,
  },
});