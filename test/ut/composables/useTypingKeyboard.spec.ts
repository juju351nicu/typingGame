import {
  getNextKey,
  isMissKey,
  normalizeAlphabetKey,
} from "@/composables/useTypingKeyboard";
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

describe("useTypingKeyboard", () => {
  it("小文字アルファベットに正規化する", () => {
    expect(normalizeAlphabetKey("A")).toBe("a");
    expect(normalizeAlphabetKey("z")).toBe("z");
    expect(normalizeAlphabetKey("Shift")).toBe("");
    expect(normalizeAlphabetKey("1")).toBe("");
  });

  it("入力済み文字列から次に入力すべきキーを返す", () => {
    expect(getNextKey([createWord("home")], "")).toBe("h");
    expect(getNextKey([createWord("home")], "ho")).toBe("m");
  });

  it("入力が単語と一致しない場合は本来入力すべきキーを返す", () => {
    expect(getNextKey([createWord("home")], "x")).toBe("h");
    expect(getNextKey([createWord("home")], "hox")).toBe("m");
  });

  it("破裂中の単語は次キー判定から除外する", () => {
    expect(getNextKey([createWord("home", true)], "")).toBe("");
  });

  it("押したキーが次キーと違う場合だけミスキーとして判定する", () => {
    expect(isMissKey("h", "h")).toBe(false);
    expect(isMissKey("x", "h")).toBe(true);
    expect(isMissKey("Shift", "h")).toBe(false);
    expect(isMissKey("h", "")).toBe(false);
  });
});
