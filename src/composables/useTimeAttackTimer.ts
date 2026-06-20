import { ref } from "vue";
import type { TimeLimitSeconds } from "@/types/interfaces";

interface TimeAttackTimerOptions {
  /** タイムアタックの制限時間（秒） */
  timeLimitSeconds: TimeLimitSeconds;
  /** 残り時間が0秒になった時に実行する処理 */
  onTimeUp: () => void;
}

/**
 * タイムアタックモードの残り時間を管理する。
 *
 * 単語追加・単語移動のゲーム用タイマーとは責務を分け、
 * 制限時間だけを扱うことで通常モードのタイマー処理へ影響を出しにくくする。
 */
export const useTimeAttackTimer = () => {
  const remainingSeconds = ref(0);
  const timerId = ref<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpCallback = ref<(() => void) | null>(null);

  /** タイムアタック用のintervalを停止する。 */
  const stopTimeAttackTimer = (): void => {
    if (timerId.value !== null) {
      clearInterval(timerId.value);
      timerId.value = null;
    }
  };

  /** 残り時間を初期状態に戻す。 */
  const resetTimeAttackTimer = (): void => {
    stopTimeAttackTimer();
    onTimeUpCallback.value = null;
    remainingSeconds.value = 0;
  };

  /** 残り時間を1秒ずつ減らすintervalを開始する。 */
  const startCountdownInterval = (): void => {
    stopTimeAttackTimer();

    timerId.value = setInterval(() => {
      remainingSeconds.value = Math.max(remainingSeconds.value - 1, 0);

      if (remainingSeconds.value === 0) {
        // 時間切れ後にintervalが残ると、ゲーム終了処理が複数回走る可能性がある。
        stopTimeAttackTimer();
        onTimeUpCallback.value?.();
      }
    }, 1000);
  };

  /**
   * タイムアタックのカウントダウンを開始する。
   *
   * @param options 制限時間と時間切れ時のコールバック
   */
  const startTimeAttackTimer = (options: TimeAttackTimerOptions): void => {
    onTimeUpCallback.value = options.onTimeUp;
    remainingSeconds.value = options.timeLimitSeconds;
    startCountdownInterval();
  };

  /**
   * 停止中のタイムアタックカウントダウンを再開する。
   *
   * Escapeキーで一時停止した後、Shiftキーで通常タイマーと合わせて再開するために使う。
   */
  const resumeTimeAttackTimer = (): void => {
    if (remainingSeconds.value <= 0 || onTimeUpCallback.value === null) {
      return;
    }

    startCountdownInterval();
  };

  return {
    remainingSeconds,
    startTimeAttackTimer,
    resumeTimeAttackTimer,
    stopTimeAttackTimer,
    resetTimeAttackTimer,
  };
};
