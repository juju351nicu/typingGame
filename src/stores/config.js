import { defineStore } from "pinia";
import Const from "@/constants/const.js";

export const useConfigStore = defineStore("config", {
  state: () => ({
    mode: 0,
    displayMode: Const.DISPLAY_THEME.LIGHT,
    wordStyleWidth: 200,
    insertion: 0,
    animation: 0,
  }),

  getters: {
    getGameMode() {
      return this.mode;
    },
    getDisplayMode() {
      return this.displayMode;
    },
    getWordStyleWidth() {
      return this.wordStyleWidth;
    },
    getInsertionSpeed() {
      return this.insertion;
    },
    getAnimationSpeed() {
      return this.animation;
    },
  },
  actions: {
    saveGameMode(selectedGameMode) {
      this.mode = selectedGameMode;
      switch (selectedGameMode) {
        case 0:
          this.insertion = 4;
          this.animation = 60;
          break;
        case 1:
          this.insertion = 3;
          this.animation = 30;
          break;
        case 2:
          this.insertion = 2;
          this.animation = 15;
          break;
        default:
          this.insertion = 4;
          this.animation = 60;
          break;
      }
    },
    saveDisplayMode(theme) {
      this.displayMode = theme;
    },
    /**
     * 単語を表示するインターバルをクリアする
     */
    clearInterval() {
      this.insertion = 0;
      this.animation = 0;
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
