import { resetGameScores } from "@/composables/useScoreReset";
import type { Alert } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

describe("useScoreReset", () => {
  it("保存済みスコアを削除し成功アラートを追加する", () => {
    const gameScoresStore = {
      deleteGameScoreList: vi.fn(),
    };
    const alerts: Alert[] = [];

    resetGameScores(gameScoresStore, alerts);

    expect(gameScoresStore.deleteGameScoreList).toHaveBeenCalledTimes(1);
    expect(alerts).toEqual([
      {
        message: "スコアを初期化しました。",
        type: "success",
      },
    ]);
  });
});
