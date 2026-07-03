import type { GameScore } from "@/types/interfaces";

/**
 * スコア一覧に新しいスコアを追加する。
 * @param scores 現在のスコア一覧
 * @param score 追加するスコア
 * @returns 追加後のスコア一覧
 */
export const saveGameScore = (
  scores: GameScore[],
  score: GameScore
): GameScore[] => {
  return [...scores, score];
};

/**
 * 保存済みスコアを削除する。
 * @returns 空のスコア一覧
 */
export const deleteGameScores = (): GameScore[] => {
  return [];
};
