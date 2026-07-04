import { watch, type Ref } from "vue";
import type {
  GameRule,
  GameScore,
  TimeLimitSeconds,
} from "@/types/interfaces";
import type { GameTimerControl } from "@/composables/useGamePageKeyboardHandlers";
import {
  createGamePageScore,
  saveGamePageScore,
} from "@/composables/useGamePageScore";

interface GameScoreStore {
  /** ゲームスコアを保存する */
  saveGameScoreList: (score: GameScore) => void;
}

interface GameConfigState {
  /** 現在の難易度 */
  getGameMode: number;
  /** 現在のゲームルール */
  getGameRule: GameRule;
  /** タイムアタックの制限時間 */
  getTimeLimitSeconds: TimeLimitSeconds;
}

interface StartTimeAttackTimerOptions {
  /** タイムアタックの制限時間 */
  timeLimitSeconds: TimeLimitSeconds;
  /** 制限時間に到達した時の処理 */
  onTimeUp: () => void;
}

interface GamePageSessionOptions {
  /** スコア保存ストア */
  gameScoresStore: GameScoreStore;
  /** ゲーム設定ストア */
  configStore: GameConfigState;
  /** 通常タイマーコンポーネント */
  timerComponent: Ref<GameTimerControl | null>;
  /** タイムアタックが選択されているか */
  isTimeAttackMode: Readonly<Ref<boolean>>;
  /** 経過時間(ms) */
  accumTime: Readonly<Ref<number>>;
  /** 正しく入力した文字数 */
  correctCharacterCount: Readonly<Ref<number>>;
  /** 現在のスコア */
  gameScore: Readonly<Ref<number>>;
  /** ゲームオーバーフラグ */
  isGameOver: Ref<boolean>;
  /** ゲーム開始済みか */
  isGameStarted: Ref<boolean>;
  /** 最後に保存したスコア */
  lastScore: Ref<GameScore>;
  /** ミスした文字数 */
  missCount: Readonly<Ref<number>>;
  /** 入力した文字数 */
  typedCharacterCount: Readonly<Ref<number>>;
  /** タイムアタックタイマーを開始する */
  startTimeAttackTimer: (options: StartTimeAttackTimerOptions) => void;
  /** タイムアタックタイマーを停止する */
  stopTimeAttackTimer: () => void;
  /** タイムアタックタイマーをリセットする */
  resetTimeAttackTimer: () => void;
}

/**
 * ゲーム画面の開始と終了処理を管理する。
 *
 * 通常モードとタイムアタックモードの開始処理、ゲーム終了時のタイマー停止、
 * スコア作成・保存をまとめる。
 *
 * @param options ゲーム開始・終了に必要な状態と処理
 */
export const useGamePageSession = (options: GamePageSessionOptions) => {
  /** ゲーム終了時に保存するスコアを作成してストアへ保存する。 */
  const saveGameScores = (): void => {
    options.lastScore.value = createGamePageScore({
      score: options.gameScore.value,
      mode: options.configStore.getGameMode,
      gameRule: options.configStore.getGameRule,
      timeLimitSeconds: options.configStore.getTimeLimitSeconds,
      isTimeAttackMode: options.isTimeAttackMode.value,
      accumTime: options.accumTime.value,
      typedCharacterCount: options.typedCharacterCount.value,
      missCount: options.missCount.value,
      correctCharacterCount: options.correctCharacterCount.value,
    });
    saveGamePageScore(options.gameScoresStore, options.lastScore.value);
  };

  /** ゲームを開始する。 */
  const startGame = (): void => {
    options.isGameStarted.value = true;

    if (options.isTimeAttackMode.value) {
      options.startTimeAttackTimer({
        timeLimitSeconds: options.configStore.getTimeLimitSeconds,
        onTimeUp: () => {
          options.isGameOver.value = true;
        },
      });
    } else {
      options.resetTimeAttackTimer();
    }
  };

  watch(options.isGameOver, (newValue) => {
    if (newValue) {
      options.timerComponent.value?.stopTimer?.();
      options.stopTimeAttackTimer();
      saveGameScores();
    }
  });

  return {
    saveGameScores,
    startGame,
  };
};
