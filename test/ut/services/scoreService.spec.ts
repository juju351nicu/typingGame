import { deleteGameScores, saveGameScore } from "@/services/scoreService";
import type { GameScore } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

describe("scoreService", () => {
  const savedScore: GameScore = {
    score: 8,
    mode: 1,
    time: "00:00:30.00",
    date: "2026-07-04 10:00:00",
  };

  const newScore: GameScore = {
    score: 12,
    mode: 2,
    time: "00:00:28.00",
    date: "2026-07-04 10:10:00",
    wpm: 32,
    accuracy: 96,
    missCount: 2,
    correctCharacterCount: 80,
  };

  it("既存スコア一覧に新しいスコアを追加する", () => {
    const result = saveGameScore([savedScore], newScore);

    expect(result).toEqual([savedScore, newScore]);
  });

  it("既存スコア一覧を変更しない", () => {
    const scores = [savedScore];

    saveGameScore(scores, newScore);

    expect(scores).toEqual([savedScore]);
  });

  it("保存済みスコアを空にする", () => {
    expect(deleteGameScores()).toEqual([]);
  });
});
