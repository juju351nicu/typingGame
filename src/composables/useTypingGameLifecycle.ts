import type { TypingTimerOptions } from "@/composables/useTypingTimers";

interface TypingGameStartOptions extends TypingTimerOptions {
  stopTimers: () => void;
  saveGameMode: () => void;
}

interface TypingGameResetOptions {
  stopTimers: () => void;
  resetWords: () => void;
  resetInputMiss: () => void;
  updateNextKey: () => void;
}

/**
 * ゲーム開始時に必要な初期処理とタイマー開始を実行する。
 *
 * 既存タイマーの停止、設定保存、初回単語追加、ゲーム用 interval の開始を
 * まとめて扱い、TypingPanel.vue 側の watch 処理を薄く保つ。
 *
 * @param options ゲーム開始に必要なコールバックとタイマー設定
 */
export const startTypingGame = (options: TypingGameStartOptions): void => {
  options.stopTimers();
  options.saveGameMode();
  options.addWord();
  options.startTimers({
    addWord: options.addWord,
    moveWords: options.moveWords,
    checkGameOver: options.checkGameOver,
    addWordInterval: options.addWordInterval,
    moveWordInterval: options.moveWordInterval,
  });
};

/**
 * ゲームリセット時に必要な停止と入力状態の初期化を実行する。
 *
 * @param options リセット時に必要なコールバック
 */
export const resetTypingGame = (options: TypingGameResetOptions): void => {
  options.stopTimers();
  options.resetWords();
  options.resetInputMiss();
  options.updateNextKey();
};
