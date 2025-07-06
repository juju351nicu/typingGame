import { defineStore } from "pinia";
import indexedDB from "../utils/indexedDB.js";
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
    deleteGameScoreList() {
      this.scores = [];
    },
  },
  getters: {
    getGameScoreList() {
      indexedDB.getDatabase();
      return this.scores;
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
