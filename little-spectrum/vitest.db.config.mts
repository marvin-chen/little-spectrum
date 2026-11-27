import { defineConfig } from "vitest/config";
import path from "node:path";

// Integration checks that need a running Supabase (local `pnpm supabase start`) and .env.local.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "tests/db/server-only.ts"),
    },
  },
  test: {
    include: ["tests/db/**/*.test.ts"],
    setupFiles: ["tests/db/setup.ts"],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
