import { completeTypingWord } from "@/composables/useTypingWordCompletion";
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

describe("useTypingWordCompletion", () => {
  it("入力完了した単語がない場合は状態更新を実行しない", () => {
    const addGameScore = vi.fn();
    const addCorrectCharacterCount = vi.fn();
    const registerTimeout = vi.fn();

    const result = completeTypingWord({
      currentWords: [createWord("home")],
      inputValue: "ho",
      burstAnimationDuration: 200,
      clearInput: vi.fn(),
      addGameScore,
      addCorrectCharacterCount,
      registerTimeout,
      removeWord: vi.fn(),
      checkGameCompleted: vi.fn(),
      updateNextKey: vi.fn(),
    });

    expect(result).toBe(false);
    expect(addGameScore).not.toHaveBeenCalled();
    expect(addCorrectCharacterCount).not.toHaveBeenCalled();
    expect(registerTimeout).not.toHaveBeenCalled();
  });

  it("入力完了した単語のスコアと正タイプ数をそれぞれ加算する", () => {
    const currentWords = [createWord("home")];
    const clearInput = vi.fn();
    const addGameScore = vi.fn();
    const addCorrectCharacterCount = vi.fn();

    const result = completeTypingWord({
      currentWords,
      inputValue: "home",
      burstAnimationDuration: 200,
      clearInput,
      addGameScore,
      addCorrectCharacterCount,
      registerTimeout: vi.fn(),
      removeWord: vi.fn(),
      checkGameCompleted: vi.fn(),
      updateNextKey: vi.fn(),
    });

    expect(result).toBe(true);
    expect(currentWords[0].isBursting).toBe(true);
    expect(clearInput).toHaveBeenCalledTimes(1);
    expect(addGameScore).toHaveBeenCalledWith(1);
    expect(addCorrectCharacterCount).toHaveBeenCalledWith(4);
  });

  it("破裂アニメーション後に単語削除、完了判定、次キー更新を実行する", () => {
    const currentWords = [createWord("line")];
    const removeWord = vi.fn();
    const checkGameCompleted = vi.fn();
    const updateNextKey = vi.fn();
    const registerTimeout = vi.fn((callback: () => void) => {
      callback();
    });

    completeTypingWord({
      currentWords,
      inputValue: "line",
      burstAnimationDuration: 200,
      clearInput: vi.fn(),
      addGameScore: vi.fn(),
      addCorrectCharacterCount: vi.fn(),
      registerTimeout,
      removeWord,
      checkGameCompleted,
      updateNextKey,
    });

    expect(registerTimeout).toHaveBeenCalledWith(expect.any(Function), 200);
    expect(removeWord).toHaveBeenCalledWith(currentWords[0]);
    expect(checkGameCompleted).toHaveBeenCalledTimes(1);
    expect(updateNextKey).toHaveBeenCalledTimes(1);
  });
});
