import Util from "@/utils/gameUtils";
import Const from "@/constants/const";
import type { GameMode, GameScore, RankingScore } from "@/types/interfaces";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isEmpty", () => {
  it("空文字チェック", () => {
    const result = Util.isEmpty("");
    expect(result).toBe(true);
  });

  it("null、undefined、空配列、空Map、空Set、空plain objectを空として扱う", () => {
    expect(Util.isEmpty(null)).toBe(true);
    expect(Util.isEmpty(undefined)).toBe(true);
    expect(Util.isEmpty([])).toBe(true);
    expect(Util.isEmpty(new Map())).toBe(true);
    expect(Util.isEmpty(new Set())).toBe(true);
    expect(Util.isEmpty({})).toBe(true);
    expect(Util.isEmpty(Object.create(null))).toBe(true);
  });

  it("空白だけの文字列を空として扱う", () => {
    expect(Util.isEmpty("   ")).toBe(true);
    expect(Util.isEmpty("\n\t")).toBe(true);
  });

  it("値がある文字列、配列、Map、Set、plain objectは空として扱わない", () => {
    expect(Util.isEmpty("text")).toBe(false);
    expect(Util.isEmpty(["value"])).toBe(false);
    expect(Util.isEmpty(new Map([["key", "value"]]))).toBe(false);
    expect(Util.isEmpty(new Set(["value"]))).toBe(false);
    expect(Util.isEmpty({ key: "value" })).toBe(false);
  });

  it("0とfalseは値ありとして扱う", () => {
    expect(Util.isEmpty(0)).toBe(false);
    expect(Util.isEmpty(false)).toBe(false);
  });

  it("オプションで空白文字列、空Map、空Set、空plain objectを空扱いしない", () => {
    expect(Util.isEmpty("   ", { trimString: false })).toBe(false);
    expect(Util.isEmpty(new Map(), { mapSet: false })).toBe(false);
    expect(Util.isEmpty(new Set(), { mapSet: false })).toBe(false);
    expect(Util.isEmpty({}, { plainObject: false })).toBe(false);
  });
});

describe("isLocalStorage", () => {
  it("localStorageが利用できる場合はtrueを返す", () => {
    vi.stubGlobal("window", {
      localStorage: {},
    });

    expect(Util.isLocalStorage()).toBe(true);
  });

  it("localStorageがnullの場合はfalseを返す", () => {
    vi.stubGlobal("window", {
      localStorage: null,
    });

    expect(Util.isLocalStorage()).toBe(false);
  });

  it("localStorage参照時に例外が発生した場合はfalseを返す", () => {
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });

    expect(Util.isLocalStorage()).toBe(false);
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

describe("getCountDownTime", () => {
  it("ミリ秒をhh:mm:ss.SS形式に変換する", () => {
    expect(Util.getCountDownTime(3_723_450)).toBe("01:02:03.45");
  });

  it("100時間以上の場合は時間を3桁以上で表示する", () => {
    expect(Util.getCountDownTime(100 * 60 * 60 * 1000)).toBe("100:00:00.00");
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

describe("difficulty label and color", () => {
  it("難易度に対応した表示名と色を返す", () => {
    expect(Util.getLevel(0)).toBe("易");
    expect(Util.getLevel(1)).toBe("普");
    expect(Util.getLevel(2)).toBe("難");
    expect(Util.getColor(0)).toBe("#000080");
    expect(Util.getColor(1)).toBe("#ff00ff");
    expect(Util.getColor(2)).toBe("#ff0000");
  });

  it("未定義の難易度では例外を投げる", () => {
    expect(() => Util.getLevel(99 as GameMode)).toThrow(
      "不明なステータスです: 99"
    );
    expect(() => Util.getColor(99 as GameMode)).toThrow(
      "不明なステータスです: 99"
    );
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

  it("タイムアタックの制限時間でランキングを絞り込む", () => {
    const timeAttackScores: GameScore[] = [
      {
        score: 18,
        mode: 2,
        gameRule: Const.GAME_RULE.TIME_ATTACK,
        timeLimitSeconds: 30,
        time: "00:00:30.00",
        date: "2026-06-20 10:00:00",
      },
      {
        score: 24,
        mode: 2,
        gameRule: Const.GAME_RULE.TIME_ATTACK,
        timeLimitSeconds: 60,
        time: "00:01:00.00",
        date: "2026-06-20 10:10:00",
      },
    ];

    const result = Util.createRankingScores(
      timeAttackScores,
      null,
      Const.GAME_RULE.TIME_ATTACK,
      30
    );

    expect(result).toHaveLength(1);
    expect(result[0].timeLimitSeconds).toBe(30);
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

describe("getRankingScoreSummary", () => {
  const normalScore: RankingScore = {
    score: 12,
    mode: 1,
    time: "00:00:30.00",
    date: "2026-06-20 10:00:00",
    rank: 1,
    resultRank: "A",
  };

  const timeAttackScore: RankingScore = {
    score: 20,
    mode: 2,
    gameRule: Const.GAME_RULE.TIME_ATTACK,
    timeLimitSeconds: 60,
    time: "00:01:00.00",
    date: "2026-06-20 10:10:00",
    rank: 1,
    resultRank: "S",
  };

  it("通常モードのランキングサマリーを返す", () => {
    expect(Util.getRankingScoreSummary(normalScore)).toBe(
      "Aランク / 普 / 00:00:30.00"
    );
  });

  it("タイムアタックのランキングサマリーには制限時間を含める", () => {
    expect(Util.getRankingScoreSummary(timeAttackScore)).toBe(
      "Sランク / 難 / 60秒 / 00:01:00.00"
    );
  });

  it("ゲームルール付きのランキングサマリーを返す", () => {
    expect(
      Util.getRankingScoreSummary(timeAttackScore, { withGameRule: true })
    ).toBe("Sランク / 難 / タイムアタック 60秒 / 00:01:00.00");
  });
});

describe("createScoreTrendItems", () => {
  it("直近スコアを古い順に並べ、最大スコア基準の割合を付ける", () => {
    const scores: GameScore[] = [
      {
        score: 5,
        mode: 0,
        time: "00:00:20.00",
        date: "2026-06-20 10:00:00",
      },
      {
        score: 10,
        mode: 1,
        time: "00:00:25.00",
        date: "2026-06-20 10:10:00",
      },
      {
        score: 20,
        mode: 2,
        time: "00:00:30.00",
        date: "2026-06-20 10:20:00",
      },
    ];

    const result = Util.createScoreTrendItems(scores, 2);

    expect(result.map((item) => item.score)).toEqual([10, 20]);
    expect(result.map((item) => item.barRatio)).toEqual([50, 100]);
    expect(result.map((item) => item.playNumber)).toEqual([1, 2]);
  });

  it("スコアが0の場合は割合を0にする", () => {
    const result = Util.createScoreTrendItems(
      [
        {
          score: 0,
          mode: 0,
          time: "00:00:00.00",
          date: "2026-06-20 10:00:00",
        },
      ],
      5
    );

    expect(result[0].barRatio).toBe(0);
  });
});

describe("createPerformanceTrendItems", () => {
  const scores: GameScore[] = [
    {
      score: 5,
      mode: 0,
      time: "00:00:20.00",
      date: "2026-06-20 10:00:00",
      wpm: 12,
      accuracy: 90,
    },
    {
      score: 10,
      mode: 1,
      time: "00:00:25.00",
      date: "2026-06-20 10:10:00",
      wpm: 20,
      accuracy: 95,
    },
    {
      score: 20,
      mode: 2,
      time: "00:00:30.00",
      date: "2026-06-20 10:20:00",
      wpm: 40,
      accuracy: 100,
    },
  ];

  it("指定した指標で直近データを作成する", () => {
    const result = Util.createPerformanceTrendItems(scores, "wpm", 2);

    expect(result.map((item) => item.metricValue)).toEqual([20, 40]);
    expect(result.map((item) => item.barRatio)).toEqual([50, 100]);
    expect(result.map((item) => item.playNumber)).toEqual([1, 2]);
  });

  it("指標が未保存の履歴は対象外にする", () => {
    const result = Util.createPerformanceTrendItems(
      [
        ...scores,
        {
          score: 30,
          mode: 2,
          time: "00:00:35.00",
          date: "2026-06-20 10:30:00",
        },
      ],
      "accuracy",
      5
    );

    expect(result.map((item) => item.metricValue)).toEqual([90, 95, 100]);
  });
});
