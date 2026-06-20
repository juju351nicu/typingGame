import { ref } from "vue";

export interface TypingTimerOptions {
  /** 一定間隔で単語を追加する処理 */
  addWord: () => void;
  /** 表示中の単語を移動する処理 */
  moveWords: () => void;
  /** ゲームオーバー到達を確認する処理 */
  checkGameOver: () => void;
  /** 単語追加 interval の実行間隔 */
  addWordInterval: number;
  /** 単語移動 interval の実行間隔 */
  moveWordInterval: number;
}

/**
 * タイピングゲームで使用する interval / timeout を管理する。
 *
 * ゲーム開始時の単語追加・単語移動 interval と、風船破裂アニメーション用
 * timeout をまとめて停止できるようにする。
 */
export const useTypingTimers = () => {
  const addWordTimerId = ref<ReturnType<typeof setInterval> | null>(null);
  const moveWordTimerId = ref<ReturnType<typeof setInterval> | null>(null);
  const burstTimerIds = ref<ReturnType<typeof setTimeout>[]>([]);

  /** 登録済みのゲーム用タイマーをすべて停止する。 */
  const stopTimers = (): void => {
    if (addWordTimerId.value !== null) {
      clearInterval(addWordTimerId.value);
      addWordTimerId.value = null;
    }

    if (moveWordTimerId.value !== null) {
      clearInterval(moveWordTimerId.value);
      moveWordTimerId.value = null;
    }

    burstTimerIds.value.forEach((timerId) => clearTimeout(timerId));
    burstTimerIds.value = [];
  };

  /**
   * 単語追加と単語移動の interval を開始する。
   *
   * @param options タイマー実行時のコールバックと実行間隔
   */
  const startTimers = (options: TypingTimerOptions): void => {
    // 二重起動を防ぐため、開始前に既存タイマーを必ず止める。
    stopTimers();

    // 単語追加と単語移動は別 interval として管理する。
    addWordTimerId.value = setInterval(() => {
      options.addWord();
    }, options.addWordInterval);

    moveWordTimerId.value = setInterval(() => {
      options.moveWords();
      options.checkGameOver();
    }, options.moveWordInterval);
  };

  /**
   * 指定時間後に実行する timeout を登録する。
   *
   * 登録した timeout は、実行完了後に自動で管理対象から外れる。
   *
   * @param callback timeout後に実行する処理
   * @param duration 実行までの待機時間
   * @returns 登録した timeout のID
   */
  const registerTimeout = (
    callback: () => void,
    duration: number
  ): ReturnType<typeof setTimeout> => {
    const timerId = setTimeout(() => {
      callback();
      // 実行済みの timeout は管理対象から外し、停止時の掃除対象を減らす。
      burstTimerIds.value = burstTimerIds.value.filter((id) => id !== timerId);
    }, duration);
    burstTimerIds.value.push(timerId);
    return timerId;
  };

  return {
    startTimers,
    stopTimers,
    registerTimeout,
  };
};
