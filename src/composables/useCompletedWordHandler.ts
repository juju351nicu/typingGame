import type { currentWord } from "@/types/interfaces";
import { getCompletedWordScoreResult } from "@/composables/useTypingScore";
import { findCompletedWordIndex } from "@/composables/useTypingWords";

interface CompletedWordHandlerOptions {
  currentWords: currentWord[];
  inputValue: string;
  burstAnimationDuration: number;
  clearInput: () => void;
  addScore: (scoreDelta: number, correctCharacterDelta: number) => void;
  registerTimeout: (callback: () => void, duration: number) => void;
  removeWord: (word: currentWord) => void;
  checkGameCompleted: () => void;
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
  const index = findCompletedWordIndex(options.currentWords, options.inputValue);

  if (index === -1) {
    return false;
  }

  const targetWord = options.currentWords[index];
  targetWord.isBursting = true;
  options.clearInput();

  const scoreResult = getCompletedWordScoreResult(targetWord);
  options.addScore(
    scoreResult.scoreDelta,
    scoreResult.correctCharacterDelta
  );

  options.registerTimeout(() => {
    options.removeWord(targetWord);
    options.checkGameCompleted();
    options.updateNextKey();
  }, options.burstAnimationDuration);

  return true;
};
