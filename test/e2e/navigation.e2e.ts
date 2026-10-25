import { expect, test } from "./support/fixtures";

test.describe("画面遷移", () => {
  test("ブログ一覧から記事を開き、本文を表示する", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "ブログ" }).click();

    await expect(page).toHaveURL(/\/blogPostList$/);
    await expect(
      page.getByRole("heading", { name: "開発ノート" })
    ).toBeVisible();

    const firstPost = page.locator(".blog-card").first();
    const title = (
      await firstPost.locator(".blog-card__title").innerText()
    ).trim();
    await firstPost.click();

    await expect(page).toHaveURL(/\/guide\/.+/);
    await expect(
      page.getByRole("heading", { level: 1, name: title })
    ).toBeVisible();
  });

  test("存在しないURLでは404画面を表示し、トップページへ戻れる", async ({
    page,
  }) => {
    await page.goto("./not-exists/page/here");

    await expect(
      page.getByRole("heading", { name: "404: Not Found" })
    ).toBeVisible();
    await page.getByRole("button", { name: "トップページに戻る" }).click();
    await expect(
      page.getByRole("button", { name: "ゲームをはじめる" })
    ).toBeVisible();
  });
});

test.describe("設定画面", () => {
  test("ダークモードに切り替えると画面全体に反映され、再読み込み後も維持される", async ({
    page,
  }) => {
    await page.goto("./settingBoard");
    await page.getByRole("switch", { name: "ライト" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await expect(page.getByRole("switch", { name: "ダーク" })).toBeVisible();
  });
});
