import {
  finishTypingGame,
  finishTypingGameIfCompleted,
  finishTypingGameIfWordReachedTop,
  resetTypingGame,
  startTypingGame,
} from "@/composables/useTypingGameLifecycle";
import type { CurrentWord } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createWord = (top: number): CurrentWord => ({
  characters: ["a"],
  classList: [],
  balloonClass: "balloon-red",
  style: {
    left: "0px",
    top: `${top}px`,
  },
});

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

  it("ゲーム終了時にゲームオーバー状態へ更新してタイマーを停止する", () => {
    const calls: string[] = [];

    finishTypingGame({
      setGameOver: vi.fn(() => calls.push("setGameOver")),
      stopTimers: vi.fn(() => calls.push("stopTimers")),
    });

    expect(calls).toEqual(["setGameOver", "stopTimers"]);
  });

  it("単語が上部到達した場合にゲームを終了する", () => {
    const setGameOver = vi.fn();
    const stopTimers = vi.fn();

    finishTypingGameIfWordReachedTop({
      currentWords: [createWord(-121)],
      shouldFinishOnWordReachedTop: true,
      setGameOver,
      stopTimers,
    });

    expect(setGameOver).toHaveBeenCalledTimes(1);
    expect(stopTimers).toHaveBeenCalledTimes(1);
  });

  it("上部到達を終了条件にしない場合はゲームを終了しない", () => {
    const setGameOver = vi.fn();
    const stopTimers = vi.fn();

    finishTypingGameIfWordReachedTop({
      currentWords: [createWord(-121)],
      shouldFinishOnWordReachedTop: false,
      setGameOver,
      stopTimers,
    });

    expect(setGameOver).not.toHaveBeenCalled();
    expect(stopTimers).not.toHaveBeenCalled();
  });

  it("すべての単語を処理し終えた場合にゲームを終了する", () => {
    const setGameOver = vi.fn();
    const stopTimers = vi.fn();

    finishTypingGameIfCompleted({
      isGameCompleted: () => true,
      setGameOver,
      stopTimers,
    });

    expect(setGameOver).toHaveBeenCalledTimes(1);
    expect(stopTimers).toHaveBeenCalledTimes(1);
  });

  it("単語が残っている場合は完了扱いでゲームを終了しない", () => {
    const setGameOver = vi.fn();
    const stopTimers = vi.fn();

    finishTypingGameIfCompleted({
      isGameCompleted: () => false,
      setGameOver,
      stopTimers,
    });

    expect(setGameOver).not.toHaveBeenCalled();
    expect(stopTimers).not.toHaveBeenCalled();
  });
});
