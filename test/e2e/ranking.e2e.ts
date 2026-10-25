import { createScore, expect, seedGameScores, test } from "./support/fixtures";

test.describe("ランキング画面（自分の記録）", () => {
  test.beforeEach(async ({ page }) => {
    // 12件のプレイ履歴。スコアは1〜12点で、新しい記録ほど高い。
    await seedGameScores(
      page,
      Array.from({ length: 12 }, (_, index) => createScore(index))
    );
    await page.goto("./scoresBoard");
  });

  test("サマリーに最高スコアとプレイ回数を表示する", async ({ page }) => {
    await expect(page.getByText("最高スコア")).toBeVisible();
    await expect(page.locator(".best-score-card .summary-value")).toHaveText(
      "12"
    );
    await expect(
      page.locator(".summary-card", { hasText: "プレイ回数" })
    ).toContainText("12");
  });

  test("分析タブに推移の折れ線グラフとランク分布の棒グラフを表示する", async ({
    page,
  }) => {
    await page.getByRole("tab", { name: "分析" }).click();

    const lineChart = page.getByTestId("trend-line-chart").locator("canvas");
    const barChart = page
      .getByTestId("rank-distribution-chart")
      .locator("canvas");
    await expect(lineChart).toBeVisible();
    await expect(barChart).toBeVisible();
    await expect(lineChart).toHaveAttribute(
      "aria-label",
      /直近スコア推移の折れ線グラフ。1回目 3、.*10回目 12/
    );
    // スコア1〜12点は、C(0〜5)が5件、B(6〜11)が6件、A(12〜19)が1件。
    await expect(barChart).toHaveAttribute(
      "aria-label",
      "リザルトランク分布の棒グラフ。Sランク 0回、Aランク 1回、Bランク 6回、Cランク 5回"
    );
  });

  test("指標を切り替えると、グラフと表の値が切り替わる", async ({ page }) => {
    await page.getByRole("tab", { name: "分析" }).click();
    await page.getByRole("button", { name: "正確率" }).click();

    await expect(
      page.getByRole("heading", { name: "直近正確率推移" })
    ).toBeVisible();

    const trendTable = page.locator(".chart-table").first();
    await trendTable.getByText("表で見る").click();
    await expect(
      trendTable.getByRole("columnheader", { name: "正確率" })
    ).toBeVisible();
    // 最も新しい12件目（index 11）の正確率は 90 + 1 = 91%。
    await expect(trendTable.locator("tbody tr").last()).toContainText("91%");
  });

  test("ランキング表は画面内でページを送る", async ({ page }) => {
    await page.getByRole("tab", { name: "ランキング表" }).click();

    const table = page.locator(".ranking-table");
    await expect(table.getByText("1-5 of 12")).toBeVisible();
    await expect(table.locator("tbody tr").first()).toContainText("1位");

    await page.getByRole("button", { name: "次のページ" }).click();
    await expect(table.getByText("6-10 of 12")).toBeVisible();
    await expect(table.locator("tbody tr").first()).toContainText("6位");

    await page.getByRole("button", { name: "最後のページ" }).click();
    await expect(table.getByText("11-12 of 12")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "次のページ" })
    ).toBeDisabled();
  });

  test("絞り込みに一致する記録がない場合は、空の状態を表示する", async ({
    page,
  }) => {
    await page.getByRole("combobox", { name: "難易度" }).click();
    await page.getByRole("option", { name: "Hard" }).click();
    await page.getByRole("tab", { name: "分析" }).click();

    await expect(page.getByText("表示できる履歴がありません")).toBeVisible();
    await expect(page.getByTestId("trend-line-chart")).toHaveCount(0);
  });
});
