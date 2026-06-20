import { useTypingKeyboardFeedback } from "@/composables/useTypingKeyboardFeedback";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("useTypingKeyboardFeedback", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("押下キーを一時的に保持して指定時間後に解除する", () => {
    vi.useFakeTimers();
    const { pressedKey, missKey, updateKeyFeedback } =
      useTypingKeyboardFeedback({
        pressedKeyDuration: 300,
        missKeyDuration: 600,
      });

    updateKeyFeedback("H", "h");

    expect(pressedKey.value).toBe("h");
    expect(missKey.value).toBe("");

    vi.advanceTimersByTime(300);

    expect(pressedKey.value).toBe("");
  });

  it("次キーと異なる場合はミスキーを一時的に保持する", () => {
    vi.useFakeTimers();
    const { pressedKey, missKey, updateKeyFeedback } =
      useTypingKeyboardFeedback({
        pressedKeyDuration: 300,
        missKeyDuration: 600,
      });

    updateKeyFeedback("x", "h");

    expect(pressedKey.value).toBe("x");
    expect(missKey.value).toBe("x");

    vi.advanceTimersByTime(600);

    expect(missKey.value).toBe("");
  });

  it("対象外キーは状態を更新しない", () => {
    const { pressedKey, missKey, updateKeyFeedback } =
      useTypingKeyboardFeedback();

    updateKeyFeedback("Shift", "h");

    expect(pressedKey.value).toBe("");
    expect(missKey.value).toBe("");
  });

  it("停止時に登録済みタイマーをキャンセルする", () => {
    vi.useFakeTimers();
    const { pressedKey, updateKeyFeedback, clearKeyFeedbackTimers } =
      useTypingKeyboardFeedback({
        pressedKeyDuration: 300,
      });

    updateKeyFeedback("h", "h");
    clearKeyFeedbackTimers();
    vi.advanceTimersByTime(300);

    expect(pressedKey.value).toBe("h");
  });
});
