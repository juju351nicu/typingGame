import type { CurrentWord } from "@/types/interfaces";
import { getCompletedWordScoreResult } from "@/composables/useTypingScore";
import { findCompletedWordIndex } from "@/composables/useTypingWords";

interface CompletedWordHandlerOptions {
  /** 現在表示している単語リスト */
  currentWords: CurrentWord[];
  /** 入力欄の現在値 */
  inputValue: string;
  /** 破裂アニメーションが終わるまでの待機時間 */
  burstAnimationDuration: number;
  /** 入力欄を空に戻す処理 */
  clearInput: () => void;
  /** スコアと正タイプ数を加算する処理 */
  addScore: (scoreDelta: number, correctCharacterDelta: number) => void;
  /** 遅延実行する処理をタイマー管理へ登録する処理 */
  registerTimeout: (callback: () => void, duration: number) => void;
  /** 表示中リストから単語を削除する処理 */
  removeWord: (word: CurrentWord) => void;
  /** すべての単語を処理し終えたか確認する処理 */
  checkGameCompleted: () => void;
  /** 次に入力すべきキーを更新する処理 */
  updateNextKey: () => void;
}

/**
 * 入力完了した単語がある場合に、正解時の一連の処理を実行する。
 *
 * 単語の破裂状態、入力欄のクリア、スコア加算、破裂アニメーション後の
 * 単語削除と次キー更新をまとめて扱う。
 *
 * @param options 完了単語処理に必要な状態とコールバック
 * @returns 完了単語を処理した場合はtrue
 */
export const handleCompletedWord = (
  options: CompletedWordHandlerOptions
): boolean => {
  // 完全一致した単語だけを正解処理の対象にする。
  const index = findCompletedWordIndex(
    options.currentWords,
    options.inputValue
  );

  if (index === -1) {
    return false;
  }

  const targetWord = options.currentWords[index];
  // 削除前に破裂状態へ変え、CSSアニメーションを走らせる。
  targetWord.isBursting = true;
  options.clearInput();

  const scoreResult = getCompletedWordScoreResult(targetWord);
  options.addScore(scoreResult.scoreDelta, scoreResult.correctCharacterDelta);

  // アニメーション完了後に単語を消し、完了判定と次キー更新を行う。
  options.registerTimeout(() => {
    options.removeWord(targetWord);
    options.checkGameCompleted();
    options.updateNextKey();
  }, options.burstAnimationDuration);

  return true;
};
