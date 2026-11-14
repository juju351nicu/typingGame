import type { Page } from "@playwright/test";
import { createScore, expect, seedGameScores, test } from "./support/fixtures";

/** 動画で画面の変化を追えるよう、主要操作の確定後だけ短く表示を保つ。 */
const showCurrentStep = async (page: Page): Promise<void> => {
  await page.waitForTimeout(700);
};

/** 1文字ずつ描画された先頭の風船から入力用の単語を復元する。 */
const readFirstBalloonWord = async (page: Page): Promise<string> => {
  const balloon = page.locator(".word").first();
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  return (await balloon.innerText()).replace(/\s/g, "");
};

test("Nuxt UI移行後の主要画面と技術ブログを一通り操作できる", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await seedGameScores(
    page,
    Array.from({ length: 12 }, (_, index) => createScore(index))
  );

  await page.goto("./");
  await expect(page.locator("#app")).toHaveClass(/isolate/);
  await expect(
    page.getByRole("button", { name: "ゲームをはじめる" })
  ).toBeVisible();
  await showCurrentStep(page);

  await page.goto("./settingBoard");
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("switch", { name: "ライト" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await showCurrentStep(page);

  await page.goto("./");
  await page.getByRole("button", { name: "ゲームをはじめる" }).click();
  const word = await readFirstBalloonWord(page);
  await page
    .getByRole("textbox", { name: "好きな風船の単語を入力" })
    .pressSequentially(word);
  await expect(page.getByLabel("スコア", { exact: true })).toHaveText("1");
  await showCurrentStep(page);

  await page.goto("./scoresBoard");
  await expect(page.getByText("最高スコア")).toBeVisible();
  await page.getByRole("tab", { name: "分析" }).click();
  await expect(page.getByTestId("trend-line-chart")).toBeVisible();
  await showCurrentStep(page);
  await page.getByRole("tab", { name: "ランキング表" }).click();
  await expect(page.locator(".ranking-table tbody tr")).toHaveCount(5);
  await showCurrentStep(page);

  await page.getByRole("link", { name: "ブログ" }).click();
  const migrationPost = page.locator(".blog-card", {
    hasText: "Nuxt UI移行とPlaywright動画回帰",
  });
  await expect(migrationPost).toBeVisible();
  await migrationPost.click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "見た目を維持したNuxt UI移行とPlaywright動画回帰",
    })
  ).toBeVisible();
  await expect(
    page.locator('.markdown-body pre code [class^="hljs-"]').first()
  ).toBeVisible();
  const publishedVideo = page.locator(".markdown-body video");
  await expect(publishedVideo).toBeVisible();
  await expect
    .poll(() =>
      publishedVideo.evaluate((video) => (video as HTMLVideoElement).readyState)
    )
    .toBeGreaterThanOrEqual(1);
  await publishedVideo.scrollIntoViewIfNeeded();
  await showCurrentStep(page);
});
