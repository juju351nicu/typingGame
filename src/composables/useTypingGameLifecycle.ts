import type { TypingTimerOptions } from "@/composables/useTypingTimers";
import { shouldFinishByWordReachedTop } from "@/composables/useTypingWordPositions";
import type { CurrentWord } from "@/types/interfaces";

interface TypingGameStartOptions extends TypingTimerOptions {
  /** 既存のゲーム用タイマーを停止する処理 */
  stopTimers: () => void;
  /** 開始時点のゲーム設定を保存する処理 */
  saveGameMode: () => void;
  /** 単語追加・単語移動タイマーを開始する処理 */
  startTimers: (options: TypingTimerOptions) => void;
}

interface TypingGameResetOptions {
  /** 既存のゲーム用タイマーを停止する処理 */
  stopTimers: () => void;
  /** 表示中単語と出題順を初期化する処理 */
  resetWords: () => void;
  /** 入力ミス状態を解除する処理 */
  resetInputMiss: () => void;
  /** 次に打つキー表示を更新する処理 */
  updateNextKey: () => void;
}

interface TypingGameFinishOptions {
  /** ゲームオーバー状態へ更新する処理 */
  setGameOver: () => void;
  /** 既存のゲーム用タイマーを停止する処理 */
  stopTimers: () => void;
}

interface TypingGameTopReachedOptions extends TypingGameFinishOptions {
  /** 現在表示している単語リスト */
  currentWords: CurrentWord[];
  /** 上部到達を終了条件にするか */
  shouldFinishOnWordReachedTop: boolean;
}

interface TypingGameCompletedOptions extends TypingGameFinishOptions {
  /** すべての単語を処理し終えたか判定する処理 */
  isGameCompleted: () => boolean;
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
  // 古い interval が残っていると単語追加や移動が二重に走るため、開始前に必ず止める。
  options.stopTimers();

  // 開始時点の難易度を保存し、プレイ中に設定変更しても今回の速度を固定する。
  options.saveGameMode();

  // 最初の単語はタイマーを待たずに即表示する。
  options.addWord();

  // 以降の単語追加と風船移動はタイマー管理 composable に任せる。
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
  // リセット後に古いタイマーが動き続けないよう、先に停止する。
  options.stopTimers();

  // 表示中の単語と入力状態を初期状態へ戻す。
  options.resetWords();
  options.resetInputMiss();

  // 画面上の次キー表示も空の状態に同期する。
  options.updateNextKey();
};

/**
 * ゲーム終了状態へ更新し、ゲーム用タイマーを停止する。
 *
 * @param options 終了時に必要なコールバック
 */
export const finishTypingGame = (options: TypingGameFinishOptions): void => {
  options.setGameOver();
  options.stopTimers();
};

/**
 * 単語が上部到達した場合にゲームを終了する。
 *
 * @param options 上部到達判定と終了処理に必要な値
 */
export const finishTypingGameIfWordReachedTop = (
  options: TypingGameTopReachedOptions
): void => {
  if (
    shouldFinishByWordReachedTop(
      options.currentWords,
      options.shouldFinishOnWordReachedTop
    )
  ) {
    finishTypingGame(options);
  }
};

/**
 * すべての単語を処理し終えた場合にゲームを終了する。
 *
 * @param options 完了判定と終了処理に必要な値
 */
export const finishTypingGameIfCompleted = (
  options: TypingGameCompletedOptions
): void => {
  if (options.isGameCompleted()) {
    finishTypingGame(options);
  }
};
