import { defineStore } from "pinia";
export const useGameScoresStore = defineStore("gameScores", {
  state: () => ({
    scores: [
      {
        time: "",
        score: "",
        mode: "",
        date: ""
      },
    ],
    isLoading: true,
  }),
  actions: {
    /**
     * 難易度・スコア・タイマーのオブジェクトを保存する。
     * @param {*} data
     */
    saveGameScoreList(data) {
      this.scores = this.scores || [];
      this.scores.push(data);
    },
    /**
     * ストレージにあるスコア情報を削除する。
     */
    deleteGameScoreList() {
      this.scores = [];
    },
  },
  getters: {
    /**
     * スコア情報リストを取得する。
     * @returns スコア情報リスト
     */
    getGameScoreList() {
      return this.scores;
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
