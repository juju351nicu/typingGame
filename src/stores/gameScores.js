import { defineStore } from "pinia";

export const useGameScoresStore = defineStore("gameScores", {
  state: () => ({
    scores: [],
  }),
  actions: {
    saveGameScoreList(data) {
      this.scores = data;
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
