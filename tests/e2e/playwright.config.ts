import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4173";
const shouldStartWebServer = !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: ".",
  testMatch: "scenario-a-f.spec.ts",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium-school-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } },
    },
  ],
  webServer: shouldStartWebServer
    ? {
        command: "npx vite --host 127.0.0.1 --port 4173 --strictPort",
        cwd: "../../apps/web",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: { ...process.env, VITE_MOCK_AI: "true" },
      }
    : undefined,
});
