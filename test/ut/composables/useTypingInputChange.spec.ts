import { handleTypingInputChange } from "@/composables/useTypingInputChange";
import type { CurrentWord } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createWord = (word: string): CurrentWord => ({
  characters: word.split(""),
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: "100px",
  },
});

describe("useTypingInputChange", () => {
  it("ゲームオーバー中は入力変更を状態へ反映しない", () => {
    const addTypedCharacterCount = vi.fn();
    const addMissCount = vi.fn();
    const setInputMiss = vi.fn();
    const checkWordEquality = vi.fn();
    const checkCharacter = vi.fn();
    const updateNextKey = vi.fn();

    handleTypingInputChange({
      currentWords: [createWord("home")],
      newValue: "h",
      oldValue: "",
      isGameOver: true,
      addTypedCharacterCount,
      addMissCount,
      setInputMiss,
      checkWordEquality,
      checkCharacter,
      updateNextKey,
    });

    expect(addTypedCharacterCount).not.toHaveBeenCalled();
    expect(addMissCount).not.toHaveBeenCalled();
    expect(setInputMiss).not.toHaveBeenCalled();
    expect(checkWordEquality).not.toHaveBeenCalled();
    expect(checkCharacter).not.toHaveBeenCalled();
    expect(updateNextKey).not.toHaveBeenCalled();
  });

  it("正しい入力を文字数へ反映し、完了判定とフィードバックを更新する", () => {
    const addTypedCharacterCount = vi.fn();
    const addMissCount = vi.fn();
    const setInputMiss = vi.fn();
    const checkWordEquality = vi.fn();
    const checkCharacter = vi.fn();
    const updateNextKey = vi.fn();

    handleTypingInputChange({
      currentWords: [createWord("home")],
      newValue: "ho",
      oldValue: "h",
      isGameOver: false,
      addTypedCharacterCount,
      addMissCount,
      setInputMiss,
      checkWordEquality,
      checkCharacter,
      updateNextKey,
    });

    expect(addTypedCharacterCount).toHaveBeenCalledWith(1);
    expect(addMissCount).toHaveBeenCalledWith(0);
    expect(setInputMiss).toHaveBeenCalledWith(false);
    expect(checkWordEquality).toHaveBeenCalledWith("ho");
    expect(checkCharacter).toHaveBeenCalledWith("ho");
    expect(updateNextKey).toHaveBeenCalledTimes(1);
  });

  it("不一致の入力をミス数とミス状態へ反映する", () => {
    const addTypedCharacterCount = vi.fn();
    const addMissCount = vi.fn();
    const setInputMiss = vi.fn();

    handleTypingInputChange({
      currentWords: [createWord("home")],
      newValue: "hx",
      oldValue: "h",
      isGameOver: false,
      addTypedCharacterCount,
      addMissCount,
      setInputMiss,
      checkWordEquality: vi.fn(),
      checkCharacter: vi.fn(),
      updateNextKey: vi.fn(),
    });

    expect(addTypedCharacterCount).toHaveBeenCalledWith(1);
    expect(addMissCount).toHaveBeenCalledWith(1);
    expect(setInputMiss).toHaveBeenCalledWith(true);
  });

  it("入力削除では入力数とミス数を増やさず、現在のミス状態だけ更新する", () => {
    const addTypedCharacterCount = vi.fn();
    const addMissCount = vi.fn();
    const setInputMiss = vi.fn();

    handleTypingInputChange({
      currentWords: [createWord("home")],
      newValue: "h",
      oldValue: "hx",
      isGameOver: false,
      addTypedCharacterCount,
      addMissCount,
      setInputMiss,
      checkWordEquality: vi.fn(),
      checkCharacter: vi.fn(),
      updateNextKey: vi.fn(),
    });

    expect(addTypedCharacterCount).toHaveBeenCalledWith(0);
    expect(addMissCount).toHaveBeenCalledWith(0);
    expect(setInputMiss).toHaveBeenCalledWith(false);
  });
});
