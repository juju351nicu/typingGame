import {
  resetTypingGame,
  startTypingGame,
} from "@/composables/useTypingGameLifecycle";
import { describe, expect, it, vi } from "vitest";

describe("useTypingGameLifecycle", () => {
  it("ゲーム開始時に既存タイマー停止、設定保存、初回単語追加、タイマー開始を順番に実行する", () => {
    const calls: string[] = [];
    const stopTimers = vi.fn(() => calls.push("stopTimers"));
    const saveGameMode = vi.fn(() => calls.push("saveGameMode"));
    const addWord = vi.fn(() => calls.push("addWord"));
    const moveWords = vi.fn();
    const checkGameOver = vi.fn();
    const startTimers = vi.fn(() => calls.push("startTimers"));

    startTypingGame({
      stopTimers,
      saveGameMode,
      startTimers,
      addWord,
      moveWords,
      checkGameOver,
      addWordInterval: 1000,
      moveWordInterval: 100,
    });

    expect(calls).toEqual([
      "stopTimers",
      "saveGameMode",
      "addWord",
      "startTimers",
    ]);
    expect(startTimers).toHaveBeenCalledWith({
      addWord,
      moveWords,
      checkGameOver,
      addWordInterval: 1000,
      moveWordInterval: 100,
    });
  });

  it("ゲームリセット時にタイマー停止、単語初期化、ミス状態解除、次キー更新を順番に実行する", () => {
    const calls: string[] = [];

    resetTypingGame({
      stopTimers: vi.fn(() => calls.push("stopTimers")),
      resetWords: vi.fn(() => calls.push("resetWords")),
      resetInputMiss: vi.fn(() => calls.push("resetInputMiss")),
      updateNextKey: vi.fn(() => calls.push("updateNextKey")),
    });

    expect(calls).toEqual([
      "stopTimers",
      "resetWords",
      "resetInputMiss",
      "updateNextKey",
    ]);
  });
});
