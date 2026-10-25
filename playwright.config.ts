import { defineConfig, devices } from "@playwright/test";
import {
  E2E_API_BASE_URL,
  E2E_BASE_PATH,
  E2E_PORT,
} from "./test/e2e/support/constants";

export default defineConfig({
  testDir: "./test/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    // テストでは page.goto("./scoresBoard") のように相対パスで開き、公開時のベースパス配下を確認する。
    baseURL: `http://localhost:${E2E_PORT}${E2E_BASE_PATH}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // スマホ幅でもランキング表・グラフが崩れず操作できることを確認する。
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
      testMatch: "**/ranking*.e2e.ts",
    },
  ],
  // 開発サーバーは初回アクセス時の依存関係の最適化で画面が再読み込みされることがあり、
  // テストが不安定になる。GitHub Pagesへ公開するものと同じビルド結果をpreviewで配信して確認する。
  webServer: {
    command: `npm run build && npx vite preview --port ${E2E_PORT} --strictPort`,
    url: `http://localhost:${E2E_PORT}${E2E_BASE_PATH}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      VITE_ENABLE_BACKEND_API: "true",
      VITE_API_BASE_URL: E2E_API_BASE_URL,
    },
  },
});
