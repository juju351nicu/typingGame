import { getCompletedWordScoreResult } from "@/composables/useTypingScore";
import type { CurrentWord } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

const createWord = (word: string): CurrentWord => ({
  characters: word.split(""),
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: "100px",
  },
});

describe("useTypingScore", () => {
  it("入力完了した単語からスコアと正タイプ数の加算値を返す", () => {
    expect(getCompletedWordScoreResult(createWord("home"))).toEqual({
      scoreDelta: 1,
      correctCharacterDelta: 4,
    });
  });
});
