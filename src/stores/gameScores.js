import { defineStore } from "pinia";

export const useGameScoresStore = defineStore("gameScores", {
  state: () => ({
    scores: [],
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
    deleteGameScoreList() {
      this.scores = [];
    },
  },
  getters: {
    getGameScoreList() {
      return this.scores;
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
