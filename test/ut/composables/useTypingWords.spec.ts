import {
  applyCharacterFeedback,
  createCurrentWord,
  findCompletedWordIndex,
  getWordFeedbackClass,
  hasMatchedPrefix,
  shuffleWords,
} from "@/composables/useTypingWords";
import type { currentWord } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createWord = (word: string, isBursting = false): currentWord => ({
  characters: word.split(""),
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: "100px",
  },
  isBursting,
});

describe("useTypingWords", () => {
  it("現在表示する単語を生成する", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    const result = createCurrentWord("hello", 24, 120);

    expect(result.characters).toEqual(["h", "e", "l", "l", "o"]);
    expect(result.classList).toEqual([]);
    expect(result.balloonClass).toBe("balloon-red");
    expect(result.style).toEqual({
      left: "24px",
      top: "120px",
    });

    vi.restoreAllMocks();
  });

  it("入力済み文字に correct / incorrect のクラスを付与する", () => {
    const result = applyCharacterFeedback([createWord("home")], "hope");

    expect(result[0].classList).toEqual([
      "correct",
      "correct",
      "incorrect",
      "correct",
    ]);
  });

  it("未入力部分のクラスは空文字にする", () => {
    const result = applyCharacterFeedback([createWord("home")], "ho");

    expect(result[0].classList).toEqual(["correct", "correct", "", ""]);
  });

  it("入力値が表示中の単語の先頭と一致するか判定する", () => {
    const words = [createWord("home"), createWord("line")];

    expect(hasMatchedPrefix(words, "")).toBe(true);
    expect(hasMatchedPrefix(words, "ho")).toBe(true);
    expect(hasMatchedPrefix(words, "li")).toBe(true);
    expect(hasMatchedPrefix(words, "xx")).toBe(false);
  });

  it("破裂中の単語は一致判定から除外する", () => {
    const words = [createWord("home", true)];

    expect(hasMatchedPrefix(words, "ho")).toBe(false);
    expect(findCompletedWordIndex(words, "home")).toBe(-1);
  });

  it("入力が完了した単語の位置を返す", () => {
    const words = [createWord("home"), createWord("line")];

    expect(findCompletedWordIndex(words, "line")).toBe(1);
    expect(findCompletedWordIndex(words, "like")).toBe(-1);
  });

  it("単語の入力状態に応じた表示クラスを返す", () => {
    expect(getWordFeedbackClass(createWord("home"), "", false)).toBe("");
    expect(getWordFeedbackClass(createWord("home"), "ho", false)).toBe(
      "word-active"
    );
    expect(getWordFeedbackClass(createWord("home"), "xx", true)).toBe(
      "word-miss"
    );
    expect(getWordFeedbackClass(createWord("home", true), "ho", true)).toBe(
      ""
    );
  });

  it("単語リストを破壊せずにシャッフルする", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const words = ["home", "line", "just"];

    const result = shuffleWords(words);

    expect(result).toEqual(["line", "just", "home"]);
    expect(words).toEqual(["home", "line", "just"]);

    vi.restoreAllMocks();
  });
});
