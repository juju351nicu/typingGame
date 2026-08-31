import { computed, getCurrentInstance, onUnmounted, ref, type Ref } from "vue";
import Util from "@/utils/gameUtils";

type IntervalId = ReturnType<typeof setInterval>;

type StopwatchTimerOptions = {
  /** 経過時間を更新する間隔 */
  intervalMs?: number;
};

const DEFAULT_INTERVAL_MS = 10;

/**
 * 経過時間を計測するストップウォッチタイマーを管理する。
 *
 * 画面側のv-modelで渡された経過時間refを更新し、停止後に再開した場合は
 * 停止前の経過時間から計測を続ける。
 *
 * @param accumTime 経過時間(ms)
 * @param options タイマー更新間隔などのオプション
 */
export const useStopwatchTimer = (
  accumTime: Ref<number>,
  options: StopwatchTimerOptions = {}
) => {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;

  /** スタートまたは再開した時刻 */
  const startTime = ref<number | null>(null);
  /** 停止時点までに蓄積した経過時間 */
  const stopTime = ref(0);
  /** setInterval()の格納用 */
  const timerId = ref<IntervalId | null>(null);
  /** タイマーが動作中か */
  const isRunning = ref(false);

  /** 表示用の経過時間 */
  const timeLabel = computed((): string => {
    return Util.getCountDownTime(accumTime.value);
  });

  /** 現在時刻から経過時間を再計算する。 */
  const updateTime = (): void => {
    if (startTime.value === null) {
      return;
    }
    accumTime.value = Date.now() - startTime.value + stopTime.value;
  };

  /** 経過時間の計測を開始または再開する。 */
  const startTimer = (): void => {
    if (isRunning.value) {
      return;
    }

    isRunning.value = true;
    startTime.value = Date.now();
    timerId.value = setInterval(updateTime, intervalMs);
  };

  /** 経過時間の計測を停止する。 */
  const stopTimer = (): void => {
    if (timerId.value !== null) {
      clearInterval(timerId.value);
      timerId.value = null;
    }
    isRunning.value = false;
    startTime.value = null;
    stopTime.value = accumTime.value;
  };

  /** 経過時間と内部状態を初期化する。 */
  const resetTimer = (): void => {
    stopTimer();
    accumTime.value = 0;
    stopTime.value = 0;
  };

  if (getCurrentInstance() != null) {
    onUnmounted(() => {
      resetTimer();
    });
  }

  return {
    isRunning,
    resetTimer,
    startTimer,
    stopTimer,
    timeLabel,
    updateTime,
  };
};
