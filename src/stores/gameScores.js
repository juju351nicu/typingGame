import { defineStore } from "pinia";
export const useGameScoresStore = defineStore("gameScores", {
  state: () => ({
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
    getGameScoreList() {
      return this.scores;
    },
  },
  actions: {
    /**
     * 難易度・スコア・タイマーのオブジェクトを保存する。
     * @param {*} data
     */
    saveGameScoreList(data) {
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
