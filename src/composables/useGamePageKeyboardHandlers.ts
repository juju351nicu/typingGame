import type { Ref } from "vue";

export interface GameTimerControl {
  /** タイマーを開始または再開する */
  startTimer: () => void;
  /** タイマーを停止する */
  stopTimer: () => void;
  /** タイマーをリセットする */
  resetTimer: () => void;
}

interface GamePageKeyboardHandlerOptions {
  /** 通常タイマーコンポーネント */
  timerComponent: Ref<GameTimerControl | null>;
  /** ゲーム開始済みか */
  isGameStarted: Readonly<Ref<boolean>>;
  /** ゲームオーバー済みか */
  isGameOver: Readonly<Ref<boolean>>;
  /** タイムアタックモードか */
  isTimeAttackMode: Readonly<Ref<boolean>>;
  /** 次に入力すべきキー */
  nextKey: Readonly<Ref<string>>;
  /** タイムアタックタイマーを停止する */
  stopTimeAttackTimer: () => void;
  /** タイムアタックタイマーを再開する */
  resumeTimeAttackTimer: () => void;
  /** 仮想キーボードの押下・ミス表示を更新する */
  updateKeyFeedback: (eventKey: string, nextKey: string) => void;
}

/**
 * ゲーム画面のキーボードショートカット処理を作成する。
 *
 * Escapeでタイマー停止、Shiftでタイマー再開、通常入力で仮想キーボードの
 * フィードバック更新を行う。
 *
 * @param options キーボード操作に必要な状態と処理
 */
export const useGamePageKeyboardHandlers = (
  options: GamePageKeyboardHandlerOptions
) => {
  /** Escapeキーで通常タイマーとタイムアタックタイマーを停止する。 */
  const stopTimerByKeyboard = (): void => {
    options.timerComponent.value?.stopTimer?.();
    if (options.isTimeAttackMode.value) {
      options.stopTimeAttackTimer();
    }
  };

  /**
   * Escapeキー押下時にタイマーを停止する。
   *
   * @param event キーボードイベント
   */
  const handleEsc = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      stopTimerByKeyboard();
    }
  };

  /**
   * Shiftキー押下時に停止中のタイマーを再開する。
   *
   * @param event キーボードイベント
   */
  const handleShift = (event: KeyboardEvent): void => {
    if (
      event.key === "Shift" &&
      options.isGameStarted.value &&
      !options.isGameOver.value
    ) {
      options.timerComponent.value?.startTimer?.();
      if (options.isTimeAttackMode.value) {
        options.resumeTimeAttackTimer();
      }
    }
  };

  /**
   * ゲーム中のキー入力を仮想キーボード表示へ反映する。
   *
   * @param event キーボードイベント
   */
  const handleTypingKeydown = (event: KeyboardEvent): void => {
    if (!options.isGameStarted.value || options.isGameOver.value) {
      return;
    }

    options.updateKeyFeedback(event.key, options.nextKey.value);
  };

  return {
    handleEsc,
    handleShift,
    handleTypingKeydown,
    stopTimerByKeyboard,
  };
};
