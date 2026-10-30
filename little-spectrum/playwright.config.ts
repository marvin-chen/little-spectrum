import { defineConfig, devices } from "@playwright/test";

// Runs against a dev or production server on port 3000 with a configured Supabase backend.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["iPhone 13"], browserName: "chromium" } }],
});
