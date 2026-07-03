import { useResultModalState } from "@/composables/useResultModalState";
import Const from "@/constants/const";
import type { GameScore } from "@/types/interfaces";
import { ref } from "vue";
import { describe, expect, it } from "vitest";

describe("useResultModalState", () => {
  it("通常ルールのリザルト表示値を返す", () => {
    const lastScore = ref<GameScore>({
      score: 12,
      mode: 1,
      gameRule: Const.GAME_RULE.NORMAL,
      time: "00:00:30.00",
      date: "2026-07-04 10:00:00",
      wpm: 40,
      accuracy: 95,
      missCount: 2,
      correctCharacterCount: 38,
    });

    const resultState = useResultModalState(lastScore);

    expect(resultState.resultRank.value).toBe("A");
    expect(resultState.rankColor.value).toBe("#4dabf7");
    expect(resultState.gameModeLabel.value).toBe("普");
    expect(resultState.gameRuleLabel.value).toBe("通常");
    expect(resultState.timeLimitLabel.value).toBe("-");
    expect(resultState.isTimeAttackResult.value).toBe(false);
    expect(resultState.wpmLabel.value).toBe(40);
    expect(resultState.accuracyLabel.value).toBe(95);
    expect(resultState.missCountLabel.value).toBe(2);
    expect(resultState.correctCharacterCountLabel.value).toBe(38);
  });

  it("タイムアタックの制限時間表示値を返す", () => {
    const lastScore = ref<GameScore>({
      score: 20,
      mode: 2,
      gameRule: Const.GAME_RULE.TIME_ATTACK,
      timeLimitSeconds: 60,
      time: "00:01:00.00",
      date: "2026-07-04 10:00:00",
    });

    const resultState = useResultModalState(lastScore);

    expect(resultState.resultRank.value).toBe("S");
    expect(resultState.gameModeLabel.value).toBe("難");
    expect(resultState.gameRuleLabel.value).toBe("タイムアタック");
    expect(resultState.timeLimitLabel.value).toBe("60秒");
    expect(resultState.isTimeAttackResult.value).toBe(true);
  });

  it("古い保存済みスコアで未保存のメトリクスに既定値を返す", () => {
    const lastScore = ref<GameScore>({
      score: 5,
      mode: 0,
      time: "00:00:20.00",
      date: "2026-07-04 10:00:00",
    });

    const resultState = useResultModalState(lastScore);

    expect(resultState.resultRank.value).toBe("C");
    expect(resultState.gameRuleLabel.value).toBe("通常");
    expect(resultState.wpmLabel.value).toBe(0);
    expect(resultState.correctCharacterCountLabel.value).toBe(0);
    expect(resultState.accuracyLabel.value).toBe(100);
    expect(resultState.missCountLabel.value).toBe(0);
  });
});
