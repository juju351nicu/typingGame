import { getTypingInputResult } from "@/composables/useTypingInput";
import type { CurrentWord } from "@/types/interfaces";

interface TypingInputChangeOptions {
  /** 現在表示している単語リスト */
  currentWords: CurrentWord[];
  /** 変更後の入力値 */
  newValue: string;
  /** 変更前の入力値 */
  oldValue: string;
  /** ゲームオーバー中か */
  isGameOver: boolean;
  /** 入力文字数を加算する処理 */
  addTypedCharacterCount: (delta: number) => void;
  /** ミス数を加算する処理 */
  addMissCount: (delta: number) => void;
  /** 入力ミス状態を更新する処理 */
  setInputMiss: (value: boolean) => void;
  /** 完了単語の判定とスコア加算を行う処理 */
  checkWordEquality: (word: string) => void;
  /** 単語ごとの入力フィードバックを更新する処理 */
  checkCharacter: (typeBox: string) => void;
  /** 次に打つキー表示を更新する処理 */
  updateNextKey: () => void;
}

/**
 * 入力欄の変更をタイピングゲームの状態へ反映する。
 *
 * 入力文字数、ミス数、ミス状態、完了単語処理、文字フィードバック、次キー更新を
 * まとめて扱い、TypingPanel.vue の watcher を薄く保つ。
 *
 * @param options 入力変更の反映に必要な値とコールバック
 */
export const handleTypingInputChange = (
  options: TypingInputChangeOptions
): void => {
  if (options.isGameOver) {
    return;
  }

  const inputResult = getTypingInputResult(
    options.currentWords,
    options.newValue,
    options.oldValue
  );

  options.addTypedCharacterCount(inputResult.typedCharacterDelta);
  options.addMissCount(inputResult.missCountDelta);
  options.setInputMiss(inputResult.isInputMiss);
  options.checkWordEquality(options.newValue);
  options.checkCharacter(options.newValue);
  options.updateNextKey();
};
