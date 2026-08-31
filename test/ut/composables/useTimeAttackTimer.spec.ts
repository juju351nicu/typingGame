import { useTimeAttackTimer } from "@/composables/useTimeAttackTimer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("useTimeAttackTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("開始時に残り時間を設定する", () => {
    const { remainingSeconds, startTimeAttackTimer } = useTimeAttackTimer();

    startTimeAttackTimer({
      timeLimitSeconds: 30,
      onTimeUp: vi.fn(),
    });

    expect(remainingSeconds.value).toBe(30);
  });

  it("1秒ごとに残り時間を減らし0秒で終了処理を呼ぶ", () => {
    const onTimeUp = vi.fn();
    const { remainingSeconds, startTimeAttackTimer } = useTimeAttackTimer();

    startTimeAttackTimer({
      timeLimitSeconds: 30,
      onTimeUp,
    });
    vi.advanceTimersByTime(29000);

    expect(remainingSeconds.value).toBe(1);
    expect(onTimeUp).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(remainingSeconds.value).toBe(0);
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("停止すると残り時間の更新を止める", () => {
    const { remainingSeconds, startTimeAttackTimer, stopTimeAttackTimer } =
      useTimeAttackTimer();

    startTimeAttackTimer({
      timeLimitSeconds: 60,
      onTimeUp: vi.fn(),
    });
    vi.advanceTimersByTime(1000);
    stopTimeAttackTimer();
    vi.advanceTimersByTime(5000);

    expect(remainingSeconds.value).toBe(59);
  });

  it("停止後に残り時間から再開する", () => {
    const onTimeUp = vi.fn();
    const {
      remainingSeconds,
      startTimeAttackTimer,
      stopTimeAttackTimer,
      resumeTimeAttackTimer,
    } = useTimeAttackTimer();

    startTimeAttackTimer({
      timeLimitSeconds: 30,
      onTimeUp,
    });
    vi.advanceTimersByTime(5000);
    stopTimeAttackTimer();
    vi.advanceTimersByTime(5000);

    expect(remainingSeconds.value).toBe(25);

    resumeTimeAttackTimer();
    vi.advanceTimersByTime(25000);

    expect(remainingSeconds.value).toBe(0);
    expect(onTimeUp).toHaveBeenCalledTimes(1);
  });

  it("リセットするとタイマーを停止して残り時間を0に戻す", () => {
    const onTimeUp = vi.fn();
    const { remainingSeconds, startTimeAttackTimer, resetTimeAttackTimer } =
      useTimeAttackTimer();

    startTimeAttackTimer({
      timeLimitSeconds: 90,
      onTimeUp,
    });
    resetTimeAttackTimer();
    vi.advanceTimersByTime(90000);

    expect(remainingSeconds.value).toBe(0);
    expect(onTimeUp).not.toHaveBeenCalled();
  });

  it("リセット後は再開しない", () => {
    const onTimeUp = vi.fn();
    const {
      startTimeAttackTimer,
      resetTimeAttackTimer,
      resumeTimeAttackTimer,
    } = useTimeAttackTimer();

    startTimeAttackTimer({
      timeLimitSeconds: 30,
      onTimeUp,
    });
    resetTimeAttackTimer();
    resumeTimeAttackTimer();
    vi.advanceTimersByTime(30000);

    expect(onTimeUp).not.toHaveBeenCalled();
  });
});
