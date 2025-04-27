import { defineStore } from "pinia";

export const useCounterStore = defineStore("gameScores", {
  state: () => ({
    scores: [],
  }),
  actions: {
    saveGameScores(data) {
      this.scores = data;
    },
    resetGameScoreFromStorage() {
      this.scores = [];
    },
  },
  getters: {
    getGameScores() {
      return this.scores;
    },
  },
  // SessionStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
