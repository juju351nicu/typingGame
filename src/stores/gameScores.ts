import { defineStore } from "pinia";
import type { GameScore } from "@/types/interfaces";
/**
 * ゲームスコアのストアで使用する型定義
 */
interface GameScoresState {
  scores: GameScore[];
  isLoading: boolean;
}
/**
 * ゲームスコアのストア
 */
export const useGameScoresStore = defineStore("gameScores", {
  state: (): GameScoresState => ({
    /** スコア情報リスト */
    scores: [],
    /** ローディングフラグ */
    isLoading: true,
  }),
  getters: {
    /**
     * スコア情報リストを取得する。
     * @returns スコア情報リスト
     */
    getGameScoreList(): GameScore[] {
      return this.scores;
    },
  },
  actions: {
    /**
     * 難易度・スコア・タイマーのオブジェクトを保存する。
     * @param {*} data
     */
    saveGameScoreList(data: GameScore) {
      this.scores.push(data);
    },
    /**
     * ストレージにあるスコア情報を削除する。
     */
    deleteGameScoreList() {
      this.scores = [];
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
