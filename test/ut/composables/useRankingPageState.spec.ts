import {
  getRankingRankClass,
  useRankingPageState,
} from "@/composables/useRankingPageState";
import Const from "@/constants/const";
import type { GameScore } from "@/types/interfaces";
import { nextTick, reactive } from "vue";
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

  it("推移グラフの指標に応じたラベルを返す", () => {
    const store = reactive({ getGameScoreList: scores });
    const rankingState = useRankingPageState(store);

    rankingState.selectedTrendMetric.value = "accuracy";

    expect(rankingState.trendTitle.value).toBe("直近正確率推移");
    expect(
      rankingState.getTrendValueLabel({
        label: "1",
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
});
