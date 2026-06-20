import Util from "@/utils/gameUtils";
import Const from "@/constants/const";
import type { GameScore } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

describe("isEmpty", () => {
  it("空文字チェック", () => {
    const result = Util.isEmpty("");
    expect(result).toBe(true);
  });
});

describe("calculateWpm", () => {
  it("正しく入力した文字数と時間からWPMを計算する", () => {
    const result = Util.calculateWpm(25, 60_000);
    expect(result).toBe(5);
  });

  it("入力文字数または時間が0以下の場合は0を返す", () => {
    expect(Util.calculateWpm(0, 60_000)).toBe(0);
    expect(Util.calculateWpm(25, 0)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("入力文字数とミス数から正確率を計算する", () => {
    const result = Util.calculateAccuracy(10, 2);
    expect(result).toBe(80);
  });

  it("入力文字数が0の場合は100を返す", () => {
    expect(Util.calculateAccuracy(0, 0)).toBe(100);
  });

  it("ミス数が入力文字数を超えた場合は0を返す", () => {
    expect(Util.calculateAccuracy(5, 10)).toBe(0);
  });
});

describe("getResultRank", () => {
  it("スコアからランクを判定する", () => {
    expect(Util.getResultRank(20)).toBe("S");
    expect(Util.getResultRank(12)).toBe("A");
    expect(Util.getResultRank(6)).toBe("B");
    expect(Util.getResultRank(5)).toBe("C");
  });
});

describe("getResultRankColor", () => {
  it("ランクに対応した色を返す", () => {
    expect(Util.getResultRankColor("S")).toBe("#ffd43b");
    expect(Util.getResultRankColor("A")).toBe("#4dabf7");
    expect(Util.getResultRankColor("B")).toBe("#51cf66");
    expect(Util.getResultRankColor("C")).toBe("#868e96");
  });
});

describe("createRankingScores", () => {
  const scores: GameScore[] = [
    {
      score: 8,
      mode: 1,
      time: "00:00:35.00",
      date: "2026-05-24 12:00:00",
    },
    {
      score: 12,
      mode: 2,
      time: "00:00:40.00",
      date: "2026-05-24 12:10:00",
    },
    {
      score: 12,
      mode: 1,
      time: "00:00:30.00",
      date: "2026-05-24 12:20:00",
      wpm: 20,
      accuracy: 95,
      missCount: 2,
    },
    {
      score: 12,
      mode: 1,
      time: "00:00:30.00",
      date: "2026-05-24 12:30:00",
    },
  ];

  it("スコア降順、同点ならタイム昇順、さらに同条件なら日付降順で並べる", () => {
    const result = Util.createRankingScores(scores);

    expect(result.map((item) => item.date)).toEqual([
      "2026-05-24 12:30:00",
      "2026-05-24 12:20:00",
      "2026-05-24 12:10:00",
      "2026-05-24 12:00:00",
    ]);
    expect(result.map((item) => item.rank)).toEqual([1, 2, 3, 4]);
    expect(result[0].resultRank).toBe("A");
  });

  it("難易度でランキングを絞り込む", () => {
    const result = Util.createRankingScores(scores, 2);

    expect(result).toHaveLength(1);
    expect(result[0].mode).toBe(2);
    expect(result[0].rank).toBe(1);
  });

  it("ゲームルールでランキングを絞り込む", () => {
    const timeAttackScore: GameScore = {
      score: 20,
      mode: 2,
      gameRule: Const.GAME_RULE.TIME_ATTACK,
      timeLimitSeconds: 60,
      time: "00:01:00.00",
      date: "2026-06-20 10:00:00",
    };

    const result = Util.createRankingScores(
      [...scores, timeAttackScore],
      null,
      Const.GAME_RULE.TIME_ATTACK
    );

    expect(result).toHaveLength(1);
    expect(result[0].gameRule).toBe(Const.GAME_RULE.TIME_ATTACK);
    expect(result[0].rank).toBe(1);
  });
});

describe("game rule label", () => {
  it("既存スコアは通常モードとして扱う", () => {
    const score: GameScore = {
      score: 10,
      mode: 1,
      time: "00:00:30.00",
      date: "2026-06-20 10:00:00",
    };

    expect(Util.getGameRule(score)).toBe(Const.GAME_RULE.NORMAL);
    expect(Util.getScoreGameRuleLabel(score)).toBe("通常");
    expect(Util.getTimeLimitLabel(score)).toBe("-");
  });

  it("タイムアタックスコアの表示名と制限時間を返す", () => {
    const score: GameScore = {
      score: 10,
      mode: 1,
      gameRule: Const.GAME_RULE.TIME_ATTACK,
      timeLimitSeconds: 90,
      time: "00:01:30.00",
      date: "2026-06-20 10:00:00",
    };

    expect(Util.getGameRule(score)).toBe(Const.GAME_RULE.TIME_ATTACK);
    expect(Util.getScoreGameRuleLabel(score)).toBe("タイムアタック");
    expect(Util.getTimeLimitLabel(score)).toBe("90秒");
  });
});
