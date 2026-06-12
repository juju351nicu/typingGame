import type { currentWord } from "@/types/interfaces";

export interface CompletedWordScoreResult {
  scoreDelta: number;
  correctCharacterDelta: number;
}

/**
 * 入力完了した単語から、スコアと正タイプ数の加算値を算出する。
 *
 * 1単語を正しく入力したらスコアを1増やし、正タイプ数には単語の文字数を加算する。
 *
 * @param word 入力完了した単語
 * @returns スコア更新に使う加算値
 */
export const getCompletedWordScoreResult = (
  word: currentWord
): CompletedWordScoreResult => {
  return {
    scoreDelta: 1,
    correctCharacterDelta: word.characters.length,
  };
};
