import { useTypingTimers } from "@/composables/useTypingTimers";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("useTypingTimers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("単語追加と単語移動のタイマーを開始する", () => {
    vi.useFakeTimers();
    const addWord = vi.fn();
    const moveWords = vi.fn();
    const checkGameOver = vi.fn();
    const { startTimers, stopTimers } = useTypingTimers();

    startTimers({
      addWord,
      moveWords,
      checkGameOver,
      addWordInterval: 1000,
      moveWordInterval: 100,
    });

    vi.advanceTimersByTime(1000);

    expect(addWord).toHaveBeenCalledTimes(1);
    expect(moveWords).toHaveBeenCalledTimes(10);
    expect(checkGameOver).toHaveBeenCalledTimes(10);

    stopTimers();
  });

  it("停止後は登録済みタイマーを実行しない", () => {
    vi.useFakeTimers();
    const addWord = vi.fn();
    const moveWords = vi.fn();
    const checkGameOver = vi.fn();
    const { startTimers, stopTimers } = useTypingTimers();

    startTimers({
      addWord,
      moveWords,
      checkGameOver,
      addWordInterval: 1000,
      moveWordInterval: 100,
    });
    stopTimers();

    vi.advanceTimersByTime(1000);

    expect(addWord).not.toHaveBeenCalled();
    expect(moveWords).not.toHaveBeenCalled();
    expect(checkGameOver).not.toHaveBeenCalled();
  });

  it("登録したtimeoutを実行する", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { registerTimeout } = useTypingTimers();

    registerTimeout(callback, 200);
    vi.advanceTimersByTime(199);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("停止時に登録済みtimeoutをキャンセルする", () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const { registerTimeout, stopTimers } = useTypingTimers();

    registerTimeout(callback, 200);
    stopTimers();
    vi.advanceTimersByTime(200);

    expect(callback).not.toHaveBeenCalled();
  });
});
