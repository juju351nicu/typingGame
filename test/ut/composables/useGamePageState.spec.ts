import {
  createEmptyGameScore,
  useGamePageState,
} from "@/composables/useGamePageState";
import Const from "@/constants/const";
import { describe, expect, it } from "vitest";

describe("useGamePageState", () => {
  it("初期状態のゲームスコアを生成する", () => {
    expect(createEmptyGameScore()).toEqual({
      score: 0,
      mode: 0,
      time: "",
      date: "",
    });
  });

  it("ゲーム画面の状態を初期状態に戻す", () => {
    const state = useGamePageState();

    state.isGameStarted.value = true;
    state.accumTime.value = 123;
    state.inputValue.value = "typing";
    state.isGameOver.value = true;
    state.gameScore.value = 999;
    state.typedCharacterCount.value = 40;
    state.missCount.value = 3;
    state.correctCharacterCount.value = 37;
    state.isInputMiss.value = true;
    state.nextKey.value = "g";
    state.lastScore.value = {
      score: 999,
      mode: 2,
      gameRule: Const.GAME_RULE.TIME_ATTACK,
      timeLimitSeconds: 60,
      time: "00:01:00",
      date: "2026-07-04 10:00:00",
      wpm: 37,
      accuracy: 92.5,
      missCount: 3,
      correctCharacterCount: 37,
    };

    state.resetGamePageState();

    expect(state.isGameStarted.value).toBe(false);
    expect(state.accumTime.value).toBe(0);
    expect(state.inputValue.value).toBe("");
    expect(state.isGameOver.value).toBe(false);
    expect(state.gameScore.value).toBe(0);
    expect(state.typedCharacterCount.value).toBe(0);
    expect(state.missCount.value).toBe(0);
    expect(state.correctCharacterCount.value).toBe(0);
    expect(state.isInputMiss.value).toBe(false);
    expect(state.nextKey.value).toBe("");
    expect(state.lastScore.value).toEqual(createEmptyGameScore());
  });
});
