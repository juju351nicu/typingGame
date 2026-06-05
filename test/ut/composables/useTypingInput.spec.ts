import { getTypingInputResult } from "@/composables/useTypingInput";
import type { currentWord } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

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

describe("useTypingInput", () => {
  it("正しく入力が進んだ場合は入力文字数だけを増やす", () => {
    expect(getTypingInputResult([createWord("home")], "ho", "h")).toEqual({
      typedCharacterDelta: 1,
      missCountDelta: 0,
      isInputMiss: false,
    });
  });

  it("単語と一致しない入力が増えた場合は入力文字数とミス数を増やす", () => {
    expect(getTypingInputResult([createWord("home")], "hx", "h")).toEqual({
      typedCharacterDelta: 1,
      missCountDelta: 1,
      isInputMiss: true,
    });
  });

  it("入力を削除した場合は入力文字数とミス数を増やさない", () => {
    expect(getTypingInputResult([createWord("home")], "h", "hx")).toEqual({
      typedCharacterDelta: 0,
      missCountDelta: 0,
      isInputMiss: false,
    });
  });

  it("破裂中の単語は一致判定から除外する", () => {
    expect(getTypingInputResult([createWord("home", true)], "h", "")).toEqual({
      typedCharacterDelta: 1,
      missCountDelta: 1,
      isInputMiss: true,
    });
  });
});
