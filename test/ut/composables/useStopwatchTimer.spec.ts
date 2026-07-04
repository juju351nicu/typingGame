import { ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStopwatchTimer } from "@/composables/useStopwatchTimer";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useStopwatchTimer", () => {
  it("開始すると経過時間と表示用ラベルを更新する", () => {
    const accumTime = ref(0);
    const timer = useStopwatchTimer(accumTime);

    timer.startTimer();
    vi.advanceTimersByTime(1230);

    expect(accumTime.value).toBe(1230);
    expect(timer.timeLabel.value).toBe("00:00:01.23");
  });

  it("停止すると経過時間の更新を止める", () => {
    const accumTime = ref(0);
    const timer = useStopwatchTimer(accumTime);

    timer.startTimer();
    vi.advanceTimersByTime(100);
    timer.stopTimer();
    vi.advanceTimersByTime(100);

    expect(accumTime.value).toBe(100);
    expect(timer.isRunning.value).toBe(false);
  });

  it("停止後に再開すると停止前の経過時間から続ける", () => {
    const accumTime = ref(0);
    const timer = useStopwatchTimer(accumTime);

    timer.startTimer();
    vi.advanceTimersByTime(100);
    timer.stopTimer();
    timer.startTimer();
    vi.advanceTimersByTime(50);

    expect(accumTime.value).toBe(150);
  });

  it("実行中に再度開始しても二重開始しない", () => {
    const accumTime = ref(0);
    const timer = useStopwatchTimer(accumTime);

    timer.startTimer();
    timer.startTimer();
    vi.advanceTimersByTime(50);

    expect(accumTime.value).toBe(50);
  });

  it("リセットするとタイマーを停止して経過時間を0に戻す", () => {
    const accumTime = ref(0);
    const timer = useStopwatchTimer(accumTime);

    timer.startTimer();
    vi.advanceTimersByTime(100);
    timer.resetTimer();
    vi.advanceTimersByTime(100);

    expect(accumTime.value).toBe(0);
    expect(timer.isRunning.value).toBe(false);
  });
});
