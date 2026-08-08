import { fileURLToPath } from "node:url";

import { defineConfig } from "vite";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  css: {
    modules: {
      generateScopedName: "resume_[name]_[local]",
    },
  },
  build: {
    ssr: fileURLToPath(new URL("./generate.tsx", import.meta.url)),
    outDir: fileURLToPath(new URL("../../../.resume-pdf", import.meta.url)),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "generate.mjs",
      },
    },
  },
});
