import {
  createGamePageScore,
  saveGamePageScore,
} from "@/composables/useGamePageScore";
import Const from "@/constants/const";
import type { GameScore } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

describe("useGamePageScore", () => {
  it("通常モードの保存用スコアを作成する", () => {
    const score = createGamePageScore({
      score: 15,
      mode: 1,
      gameRule: Const.GAME_RULE.NORMAL,
      timeLimitSeconds: 60,
      isTimeAttackMode: false,
      accumTime: 60000,
      typedCharacterCount: 50,
      missCount: 5,
      correctCharacterCount: 45,
    });

    expect(score).toMatchObject({
      score: 15,
      mode: 1,
      gameRule: Const.GAME_RULE.NORMAL,
      timeLimitSeconds: undefined,
      time: "00:01:00.00",
      wpm: 9,
      accuracy: 90,
      missCount: 5,
      correctCharacterCount: 45,
    });
    expect(score.date).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  it("タイムアタックでは制限時間も保存する", () => {
    const score = createGamePageScore({
      score: 20,
      mode: 2,
      gameRule: Const.GAME_RULE.TIME_ATTACK,
      timeLimitSeconds: 90,
      isTimeAttackMode: true,
      accumTime: 30000,
      typedCharacterCount: 30,
      missCount: 0,
      correctCharacterCount: 30,
    });

    expect(score).toMatchObject({
      score: 20,
      mode: 2,
      gameRule: Const.GAME_RULE.TIME_ATTACK,
      timeLimitSeconds: 90,
      time: "00:00:30.00",
      wpm: 12,
      accuracy: 100,
      missCount: 0,
      correctCharacterCount: 30,
    });
  });

  it("作成済みスコアをストアへ保存する", () => {
    const gameScoresStore = {
      saveGameScoreList: vi.fn(),
    };
    const score: GameScore = {
      score: 10,
      mode: 0,
      time: "00:00:10.00",
      date: "2026-07-04 10:00:00",
    };

    saveGamePageScore(gameScoresStore, score);

    expect(gameScoresStore.saveGameScoreList).toHaveBeenCalledWith(score);
  });
});
