import { test as base, type Page, type Route } from "@playwright/test";
import type { GameScore } from "@/types/interfaces";
import { E2E_API_BASE_URL } from "./constants";

/** 開発サーバーとAPIはオリジンが異なるため、ブラウザのCORS判定を通すヘッダーを付ける */
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "Accept, Authorization, Content-Type",
  "access-control-allow-methods": "GET, POST, OPTIONS",
};

/**
 * モックAPIの応答を返す。
 *
 * Content-Type: application/json を付けたGETはCORSのプリフライト（OPTIONS）が先に飛ぶため、
 * OPTIONSには本文なしの204を返す。
 *
 * @param route 差し替えるリクエスト
 * @param json 応答本文
 * @param status HTTPステータス
 */
export const fulfillApi = (
  route: Route,
  json: unknown,
  status = 200
): Promise<void> => {
  if (route.request().method() === "OPTIONS") {
    return route.fulfill({ status: 204, headers: CORS_HEADERS });
  }
  return route.fulfill({ status, headers: CORS_HEADERS, json });
};

/**
 * すべてのテストで、モックしていないAPIリクエストを503で返すpage。
 *
 * 個別のテストで登録したpage.routeが優先されるため、テストごとに必要なAPIだけを差し替えられる。
 * 意図しない通信があっても外部へ出ず、API障害時の画面として扱われる。
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(`${E2E_API_BASE_URL}/**`, (route) =>
      fulfillApi(
        route,
        { message: "E2Eテストでモックしていないリクエストです。" },
        503
      )
    );
    await use(page);
  },
});

export { expect } from "@playwright/test";

/**
 * テスト用のスコアを作成する。
 *
 * @param index 何件目のスコアか。日付とスコアをずらして並び順を確認しやすくする
 * @param overrides 上書きする項目
 * @returns ゲームスコア
 */
export const createScore = (
  index: number,
  overrides: Partial<GameScore> = {}
): GameScore => ({
  score: index + 1,
  mode: 1,
  gameRule: "normal",
  time: `00:00:${String(30 + (index % 30)).padStart(2, "0")}.00`,
  date: `2026-10-${String(1 + (index % 28)).padStart(2, "0")} 12:${String(index % 60).padStart(2, "0")}:00`,
  wpm: 20 + index,
  accuracy: 90 + (index % 10),
  missCount: index % 5,
  correctCharacterCount: 50 + index,
  ...overrides,
});

/**
 * 画面を開く前に、localStorageへ保存済みスコアを入れておく。
 *
 * Piniaの永続化プラグインはストアIDをキーにstateをJSONで保存するため、同じ形式で書き込む。
 *
 * @param page テスト対象のページ
 * @param scores 保存しておくスコア
 */
export const seedGameScores = async (
  page: Page,
  scores: GameScore[]
): Promise<void> => {
  await page.addInitScript((value) => {
    window.localStorage.setItem(
      "gameScores",
      JSON.stringify({ scores: value, isLoading: false })
    );
  }, scores);
};
