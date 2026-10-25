import type { Page } from "@playwright/test";
import type { GameScore } from "@/types/interfaces";
import { E2E_API_BASE_URL } from "./support/constants";
import { createScore, expect, fulfillApi, test } from "./support/fixtures";

/** 全体ランキングのテストデータ。スコア23〜1点のランキング順 */
const ALL_SCORES: GameScore[] = Array.from({ length: 23 }, (_, index) =>
  createScore(22 - index, { mode: index % 2 === 0 ? 2 : 1 })
);

/**
 * 全体ランキングAPIを、BEと同じ絞り込み・LIMIT/OFFSETの仕様でモックする。
 *
 * @param page テスト対象のページ
 * @returns ページ単位APIへ送られたクエリの記録
 */
const mockRankingApi = async (page: Page): Promise<URLSearchParams[]> => {
  const pageRequests: URLSearchParams[] = [];

  const filterScores = (params: URLSearchParams): GameScore[] => {
    const mode = params.get("mode");
    return ALL_SCORES.filter(
      (score) => mode === null || score.mode === Number(mode)
    );
  };

  await page.route(
    (url) => url.href.startsWith(`${E2E_API_BASE_URL}/api/rankings/page`),
    (route) => {
      const params = new URL(route.request().url()).searchParams;
      if (route.request().method() === "GET") {
        pageRequests.push(params);
      }
      const pageNumber = Number(params.get("page"));
      const size = Number(params.get("size"));
      const scores = filterScores(params);
      const offset = (pageNumber - 1) * size;
      return fulfillApi(route, {
        items: scores
          .slice(offset, offset + size)
          .map((score, index) => ({ id: offset + index + 1, ...score })),
        page: pageNumber,
        size,
        totalCount: scores.length,
        totalPages: Math.max(1, Math.ceil(scores.length / size)),
      });
    }
  );

  // サマリー・分析タブ用の上位N件API
  await page.route(
    (url) => url.href.startsWith(`${E2E_API_BASE_URL}/api/rankings?`),
    (route) => {
      const params = new URL(route.request().url()).searchParams;
      const limit = Number(params.get("limit"));
      return fulfillApi(route, filterScores(params).slice(0, limit));
    }
  );

  return pageRequests;
};

test.describe("ランキング画面（全体ランキングのサーバーサイドページング）", () => {
  test("ページ番号と件数をAPIへ渡し、受け取ったページだけを全体順位付きで表示する", async ({
    page,
  }) => {
    const pageRequests = await mockRankingApi(page);
    await page.goto("./scoresBoard");
    await page.getByRole("button", { name: "全体ランキング" }).click();
    await page.getByRole("tab", { name: "ランキング表" }).click();

    const table = page.locator(".ranking-table");
    await expect(table.getByText("1-5 of 23")).toBeVisible();
    await expect(table.locator("tbody tr")).toHaveCount(5);
    expect(pageRequests.at(-1)?.toString()).toBe("page=1&size=5");

    await page.getByRole("button", { name: "次のページ" }).click();
    await expect(table.getByText("6-10 of 23")).toBeVisible();
    // 2ページ目の先頭は、ページ内の1件目ではなく全体の6位として表示する。
    await expect(table.locator("tbody tr").first()).toContainText("6位");
    await expect(table.locator("tbody tr").first()).toContainText("18");
    expect(pageRequests.at(-1)?.toString()).toBe("page=2&size=5");

    await page.getByRole("button", { name: "最後のページ" }).click();
    await expect(table.getByText("21-23 of 23")).toBeVisible();
    await expect(table.locator("tbody tr")).toHaveCount(3);
    expect(pageRequests.at(-1)?.toString()).toBe("page=5&size=5");
  });

  test("絞り込みや表示行数を変えると、1ページ目から取得し直す", async ({
    page,
  }) => {
    const pageRequests = await mockRankingApi(page);
    await page.goto("./scoresBoard");
    await page.getByRole("button", { name: "全体ランキング" }).click();
    await page.getByRole("tab", { name: "ランキング表" }).click();
    await page.getByRole("button", { name: "次のページ" }).click();
    await expect(page.getByText("6-10 of 23")).toBeVisible();

    await page.getByRole("combobox", { name: "難易度" }).click();
    await page.getByRole("option", { name: "Hard" }).click();

    // Hardはテストデータの偶数番目の12件。
    await expect(page.getByText("1-5 of 12")).toBeVisible();
    expect(pageRequests.at(-1)?.toString()).toBe("mode=2&page=1&size=5");

    await page.getByRole("combobox", { name: "表示行数" }).click();
    await page.getByRole("option", { name: "10", exact: true }).click();
    await expect(page.getByText("1-10 of 12")).toBeVisible();
    expect(pageRequests.at(-1)?.toString()).toBe("mode=2&page=1&size=10");
  });

  test("ページ取得に失敗しても、表示中のページを維持する", async ({ page }) => {
    await mockRankingApi(page);
    await page.goto("./scoresBoard");
    await page.getByRole("button", { name: "全体ランキング" }).click();
    await page.getByRole("tab", { name: "ランキング表" }).click();
    await expect(page.getByText("1-5 of 23")).toBeVisible();

    await page.route(
      (url) => url.href.startsWith(`${E2E_API_BASE_URL}/api/rankings/page`),
      (route) => fulfillApi(route, {}, 500)
    );
    await page.getByRole("button", { name: "次のページ" }).click();

    await expect(page.getByText("1-5 of 23")).toBeVisible();
    await expect(page.locator(".ranking-table tbody tr").first()).toContainText(
      "1位"
    );
  });
});
