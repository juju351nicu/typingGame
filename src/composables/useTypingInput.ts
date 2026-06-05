import type { currentWord } from "@/types/interfaces";
import { hasMatchedPrefix } from "@/composables/useTypingWords";

/** 入力変更後にスコア系の状態へ反映する差分 */
export interface TypingInputResult {
  /** 新しく入力された文字数 */
  typedCharacterDelta: number;
  /** 新しく発生したミス数 */
  missCountDelta: number;
  /** 現在の入力値が表示中の単語と一致していないか */
  isInputMiss: boolean;
}

/**
 * 入力値の変更から、入力文字数・ミス数・ミス状態の更新差分を算出する。
 *
 * 文字が追加された場合だけ入力文字数とミス数を増やし、削除や変換中の変化では
 * カウントを増やさない。ミス状態は常に現在の入力値を基準に判定する。
 *
 * @param currentWords 現在表示している単語リスト
 * @param newValue 変更後の入力値
 * @param oldValue 変更前の入力値
 * @returns スコア系の状態へ反映する更新差分
 */
export const getTypingInputResult = (
  currentWords: currentWord[],
  newValue: string,
  oldValue: string
): TypingInputResult => {
  const isInputMiss = !hasMatchedPrefix(currentWords, newValue);

  if (newValue.length <= oldValue.length) {
    return {
      typedCharacterDelta: 0,
      missCountDelta: 0,
      isInputMiss,
    };
  }

  return {
    typedCharacterDelta: newValue.length - oldValue.length,
    missCountDelta: isInputMiss ? 1 : 0,
    isInputMiss,
  };
};
