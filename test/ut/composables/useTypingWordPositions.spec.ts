import {
  getWordTop,
  hasAnyWordReachedTop,
  hasReachedTop,
  moveWordUp,
  moveWordsUp,
} from "@/composables/useTypingWordPositions";
import type { CurrentWord } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

const createWord = (top: number, isBursting = false): CurrentWord => ({
  characters: ["a"],
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: `${top}px`,
  },
  isBursting,
});

describe("useTypingWordPositions", () => {
  it("単語の top 値を数値で取得する", () => {
    expect(getWordTop(createWord(120))).toBe(120);
  });

  it("単語を上方向へ移動する", () => {
    const word = createWord(120);

    moveWordUp(word);

    expect(word.style.top).toBe("119px");
  });

  it("指定した距離で単語を上方向へ移動する", () => {
    const word = createWord(120);

    moveWordUp(word, 8);

    expect(word.style.top).toBe("112px");
  });

  it("表示中の単語をまとめて上方向へ移動する", () => {
    const words = [createWord(120), createWord(80)];

    moveWordsUp(words);

    expect(words.map((word) => word.style.top)).toEqual(["119px", "79px"]);
  });

  it("上端に到達した単語を判定する", () => {
    expect(hasReachedTop(createWord(-121))).toBe(true);
    expect(hasReachedTop(createWord(-120))).toBe(false);
  });

  it("破裂中の単語は上端到達判定から除外する", () => {
    expect(hasReachedTop(createWord(-121, true))).toBe(false);
  });

  it("上端に到達した単語が含まれるか判定する", () => {
    const words = [createWord(80), createWord(-121)];

    expect(hasAnyWordReachedTop(words)).toBe(true);
    expect(hasAnyWordReachedTop([createWord(80), createWord(-40)])).toBe(
      false
    );
  });
});
