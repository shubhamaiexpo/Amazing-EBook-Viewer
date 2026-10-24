import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath, URL } from "node:url";

const dir = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// One config for the browser (npm run dev) and the desktop shell (npm run app:dev).
// Tauri expects a fixed port and reads the built files from dist/.
export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      $design: dir("./src/design"),
      $engine: dir("./src/engine"),
      $features: dir("./src/features"),
      $layout: dir("./src/layout"),
      $stores: dir("./src/stores"),
      $platform: dir("./src/platform"),
      $lib: dir("./src/lib"),
    },
  },
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: {
    target: "es2022",
    sourcemap: true,
    chunkSizeWarningLimit: 1600,
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts"],
  },
});
