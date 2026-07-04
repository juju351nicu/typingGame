import { nextTick, ref, type Ref } from "vue";
import type { GameTimerControl } from "@/composables/useGamePageKeyboardHandlers";

interface GamePageRestartOptions {
  /** 通常タイマーコンポーネント */
  timerComponent: Ref<GameTimerControl | null>;
  /** タイムアタックタイマーをリセットする */
  resetTimeAttackTimer: () => void;
  /** 仮想キーボードの一時ハイライトを解除する */
  clearKeyFeedbackTimers: () => void;
  /** ゲーム画面で保持する状態を初期化する */
  resetGamePageState: () => void;
}

/**
 * ゲーム画面のリトライ処理を管理する。
 *
 * ページリロードに頼らず、親コンポーネントの状態と子コンポーネントの
 * リセット通知フラグを使ってゲームを初期状態へ戻す。
 *
 * @param options リトライ時に初期化する処理
 */
export const useGamePageRestart = (options: GamePageRestartOptions) => {
  /** TypingPanelへリセットを通知するフラグ */
  const isResetTimer = ref(false);

  /**
   * TypingPanelへリセットを通知する。
   *
   * trueにした後で次の描画タイミングにfalseへ戻し、
   * 子コンポーネント側のwatchが次回リトライでも反応できる状態に戻す。
   */
  const resetTypingPanel = async (): Promise<void> => {
    isResetTimer.value = true;
    await nextTick();
    isResetTimer.value = false;
  };

  /**
   * リトライ時にゲーム画面と関連タイマーを初期状態へ戻す。
   */
  const restartGame = async (): Promise<void> => {
    options.timerComponent.value?.resetTimer?.();
    options.resetTimeAttackTimer();
    options.clearKeyFeedbackTimers();
    options.resetGamePageState();

    await resetTypingPanel();
  };

  return {
    isResetTimer,
    resetTypingPanel,
    restartGame,
  };
};
