import {
  createTrendTitle,
  formatAccuracyMetric,
  formatNullableMetric,
  formatTrendValueLabel,
  getRankingRankClass,
  getRankingSummaryText,
  getTrendMetricOption,
  useRankingPageState,
} from "@/composables/useRankingPageState";
import Const from "@/constants/const";
import type { GameScore, RankingScore } from "@/types/interfaces";
import { nextTick, reactive, ref } from "vue";
import { describe, expect, it } from "vitest";

const scores: GameScore[] = [
  {
    score: 120,
    mode: 1,
    gameRule: Const.GAME_RULE.TIME_ATTACK,
    timeLimitSeconds: 30,
    time: "00:00:30",
    date: "2026-07-01 10:00:00",
    wpm: 40,
    accuracy: 90,
    missCount: 2,
    correctCharacterCount: 20,
  },
  {
    score: 200,
    mode: 1,
    gameRule: Const.GAME_RULE.TIME_ATTACK,
    timeLimitSeconds: 60,
    time: "00:01:00",
    date: "2026-07-02 10:00:00",
    wpm: 50,
    accuracy: 95,
    missCount: 1,
    correctCharacterCount: 50,
  },
  {
    score: 180,
    mode: 1,
    gameRule: Const.GAME_RULE.NORMAL,
    time: "00:01:20",
    date: "2026-07-03 10:00:00",
    wpm: 45,
    accuracy: 92,
    missCount: 3,
    correctCharacterCount: 60,
  },
];

describe("useRankingPageState", () => {
  it("タイムアタック以外に切り替えたら制限時間フィルターを解除する", async () => {
    const store = reactive({ getGameScoreList: scores });
    const rankingState = useRankingPageState(store);

    rankingState.selectedGameRule.value = Const.GAME_RULE.TIME_ATTACK;
    rankingState.selectedTimeLimitSeconds.value = 30;
    await nextTick();

    expect(rankingState.activeTimeLimitSeconds.value).toBe(30);

    rankingState.selectedGameRule.value = Const.GAME_RULE.NORMAL;
    await nextTick();

    expect(rankingState.selectedTimeLimitSeconds.value).toBeNull();
    expect(rankingState.activeTimeLimitSeconds.value).toBeNull();
  });

  it("選択中の制限時間でタイムアタックスコアを絞り込む", () => {
    const store = reactive({ getGameScoreList: scores });
    const rankingState = useRankingPageState(store);

    rankingState.selectedGameRule.value = Const.GAME_RULE.TIME_ATTACK;
    rankingState.selectedTimeLimitSeconds.value = 30;

    expect(rankingState.rankingItems.value).toHaveLength(1);
    expect(rankingState.rankingItems.value[0].score).toBe(120);
    expect(rankingState.timeAttackBestScore.value?.timeLimitSeconds).toBe(30);
  });

  it("表示元を全体ランキングへ切り替えたらAPI由来のスコアを使う", () => {
    const store = reactive({ getGameScoreList: scores });
    const allRankingScores = ref<GameScore[]>([
      {
        score: 300,
        mode: 2,
        gameRule: Const.GAME_RULE.NORMAL,
        time: "00:00:25",
        date: "2026-07-04 10:00:00",
        wpm: 60,
        accuracy: 98,
        missCount: 1,
        correctCharacterCount: 80,
      },
    ]);
    const rankingState = useRankingPageState(store, { allRankingScores });

    expect(rankingState.gameScores.value).toEqual(scores);
    expect(rankingState.scoreSourceOptions).toEqual([
      { title: "自分の記録", value: "my" },
      { title: "全体ランキング", value: "all" },
    ]);

    rankingState.selectedScoreSource.value = "all";

    expect(rankingState.isAllRankingSelected.value).toBe(true);
    expect(rankingState.gameScores.value).toEqual(allRankingScores.value);
    expect(rankingState.rankingItems.value[0].score).toBe(300);
  });

  it("推移グラフの指標に応じたラベルを返す", () => {
    const store = reactive({ getGameScoreList: scores });
    const rankingState = useRankingPageState(store);

    rankingState.selectedTrendMetric.value = "accuracy";

    expect(rankingState.trendTitle.value).toBe("直近正確率推移");
    expect(
      rankingState.getTrendValueLabel({
        score: 200,
        mode: 1,
        gameRule: Const.GAME_RULE.TIME_ATTACK,
        timeLimitSeconds: 60,
        time: "00:01:00",
        date: "2026-07-02 10:00:00",
        wpm: 50,
        accuracy: 95,
        missCount: 1,
        correctCharacterCount: 50,
        barRatio: 100,
        metricValue: 95,
        playNumber: 1,
      })
    ).toBe("95%");
  });

  it("順位に応じたCSSクラスを返す", () => {
    expect(getRankingRankClass(1)).toBe("rank-first");
    expect(getRankingRankClass(2)).toBe("rank-second");
    expect(getRankingRankClass(3)).toBe("rank-third");
    expect(getRankingRankClass(4)).toBe("rank-normal");
  });

  it("ランキング表のメトリクス表示値を整形する", () => {
    expect(formatNullableMetric(20)).toBe("20");
    expect(formatNullableMetric("30")).toBe("30");
    expect(formatNullableMetric(null)).toBe("-");
    expect(formatNullableMetric(undefined)).toBe("-");
    expect(formatAccuracyMetric(95)).toBe("95%");
    expect(formatAccuracyMetric(null)).toBe("-");
    expect(formatAccuracyMetric(undefined)).toBe("-");
  });

  it("ランキング表のチップ表示に使う値を返す", () => {
    const store = reactive({ getGameScoreList: scores });
    const rankingState = useRankingPageState(store);
    const score = scores[0];

    expect(rankingState.getResultRankColor("A")).toBe("#4dabf7");
    expect(rankingState.getModeColor(1)).toBe("#ff00ff");
    expect(rankingState.getModeLabel(1)).toBe("普");
    expect(rankingState.getScoreGameRule(score)).toBe(
      Const.GAME_RULE.TIME_ATTACK
    );
    expect(rankingState.getScoreGameRuleLabel(score)).toBe("タイムアタック");
    expect(rankingState.getTimeLimitLabel(score)).toBe("30秒");
  });

  it("推移グラフの表示設定とラベルを整形する", () => {
    expect(getTrendMetricOption("score")).toEqual({
      title: "スコア",
      value: "score",
      unit: "",
    });
    expect(createTrendTitle("wpm")).toBe("直近WPM推移");
    expect(
      formatTrendValueLabel(
        {
          ...scores[1],
          barRatio: 100,
          metricValue: 95,
          playNumber: 1,
        },
        "accuracy"
      )
    ).toBe("95%");
  });

  it("ランキングサマリーの補足表示を整形する", () => {
    const rankingScore: RankingScore = {
      ...scores[0],
      rank: 1,
      resultRank: "S",
    };

    expect(getRankingSummaryText(null)).toBe("記録なし");
    expect(getRankingSummaryText(rankingScore)).toBe("Sランク / 普 / 30秒 / 00:00:30");
    expect(getRankingSummaryText(rankingScore, { withGameRule: true })).toBe(
      "Sランク / 普 / タイムアタック 30秒 / 00:00:30"
    );
  });
});
