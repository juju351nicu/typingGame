import { handleCompletedWord } from "@/composables/useCompletedWordHandler";
import type { currentWord } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createWord = (word: string): currentWord => ({
  characters: word.split(""),
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: "100px",
  },
});

describe("useCompletedWordHandler", () => {
  it("入力完了した単語がない場合は処理しない", () => {
    const currentWords = [createWord("home")];
    const clearInput = vi.fn();
    const addScore = vi.fn();
    const registerTimeout = vi.fn();

    const result = handleCompletedWord({
      currentWords,
      inputValue: "ho",
      burstAnimationDuration: 200,
      clearInput,
      addScore,
      registerTimeout,
      removeWord: vi.fn(),
      checkGameCompleted: vi.fn(),
      updateNextKey: vi.fn(),
    });

    expect(result).toBe(false);
    expect(currentWords[0].isBursting).toBeUndefined();
    expect(clearInput).not.toHaveBeenCalled();
    expect(addScore).not.toHaveBeenCalled();
    expect(registerTimeout).not.toHaveBeenCalled();
  });

  it("入力完了した単語の破裂状態とスコア加算を処理する", () => {
    const currentWords = [createWord("home")];
    const clearInput = vi.fn();
    const addScore = vi.fn();
    const registerTimeout = vi.fn();

    const result = handleCompletedWord({
      currentWords,
      inputValue: "home",
      burstAnimationDuration: 200,
      clearInput,
      addScore,
      registerTimeout,
      removeWord: vi.fn(),
      checkGameCompleted: vi.fn(),
      updateNextKey: vi.fn(),
    });

    expect(result).toBe(true);
    expect(currentWords[0].isBursting).toBe(true);
    expect(clearInput).toHaveBeenCalledTimes(1);
    expect(addScore).toHaveBeenCalledWith(1, 4);
    expect(registerTimeout).toHaveBeenCalledTimes(1);
  });

  it("破裂アニメーション後に単語削除と完了判定と次キー更新を実行する", () => {
    const currentWords = [createWord("home")];
    const removeWord = vi.fn();
    const checkGameCompleted = vi.fn();
    const updateNextKey = vi.fn();
    const registerTimeout = vi.fn((callback: () => void) => {
      callback();
    });

    handleCompletedWord({
      currentWords,
      inputValue: "home",
      burstAnimationDuration: 200,
      clearInput: vi.fn(),
      addScore: vi.fn(),
      registerTimeout,
      removeWord,
      checkGameCompleted,
      updateNextKey,
    });

    expect(removeWord).toHaveBeenCalledWith(currentWords[0]);
    expect(checkGameCompleted).toHaveBeenCalledTimes(1);
    expect(updateNextKey).toHaveBeenCalledTimes(1);
  });
});
