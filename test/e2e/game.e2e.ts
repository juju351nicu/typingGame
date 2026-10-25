import type { Page } from "@playwright/test";
import { expect, test } from "./support/fixtures";

/**
 * 画面に浮かんでいる風船の単語を1つ取得する。
 *
 * 風船は1文字ずつspanで描画されるため、文字の間の空白を取り除いて単語に戻す。
 *
 * @param page テスト対象のページ
 * @returns 風船の単語
 */
const readFirstBalloonWord = async (page: Page): Promise<string> => {
  const balloon = page.locator(".word").first();
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  return (await balloon.innerText()).replace(/\s/g, "");
};

test.describe("ゲーム画面", () => {
  test("風船の単語を入力すると、風船が割れてスコアが加算される", async ({
    page,
  }) => {
    await page.goto("./");
    await page.getByRole("button", { name: "ゲームをはじめる" }).click();

    const word = await readFirstBalloonWord(page);
    await page
      .getByRole("textbox", { name: "好きな風船の単語を入力" })
      .pressSequentially(word);

    await expect(page.getByLabel("スコア", { exact: true })).toHaveText("1");
    await expect(page.getByLabel("ミス数")).toHaveText("0");
  });

  test("タイムアタックは制限時間で終了し、結果がランキングに保存される", async ({
    page,
  }) => {
    // page.clockで早送りすると、10ms間隔のストップウォッチと風船の移動処理が大量に走り
    // かえって遅く不安定になる。最短の30秒を実時間で待ち、実際のプレイと同じ条件で確認する。
    test.setTimeout(90_000);
    await page.goto("./settingBoard");
    await page.getByRole("combobox", { name: "ゲームルール" }).click();
    await page.getByRole("option", { name: "タイムアタック" }).click();
    await page.getByRole("combobox", { name: "制限時間" }).click();
    await page.getByRole("option", { name: "30秒" }).click();

    await page.goto("./");
    await expect(page.getByText(/現在の設定：.*タイムアタック/)).toBeVisible();
    await page.getByRole("button", { name: "ゲームをはじめる" }).click();

    const word = await readFirstBalloonWord(page);
    await page
      .getByRole("textbox", { name: "好きな風船の単語を入力" })
      .pressSequentially(word);
    await expect(page.getByLabel("スコア", { exact: true })).toHaveText("1");

    const resultDialog = page.getByRole("dialog");
    await expect(resultDialog).toBeVisible({ timeout: 40_000 });
    await expect(resultDialog).toContainText("Result");

    await page.goto("./scoresBoard");
    await expect(
      page.locator(".summary-card", { hasText: "タイムアタックベスト" })
    ).toContainText("1");
    await expect(
      page.locator(".summary-card", { hasText: "プレイ回数" })
    ).toContainText("1");
  });
});
