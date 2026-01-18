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
    /**
     * ゲームの難易度を取得する
     * @returns 難易度の数値
     */
    getGameMode() {
      return this.mode;
    },
    /**
     * ダークモード等のディスプレイの値
     * @returns 'light'か'dark'モード
     */
    getDisplayMode() {
      return this.displayMode;
    },
    /**
     * 単語の幅のCSS長さ
     * @returns CSSのwidth
     */
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
    /**
     *
     * @param {number} selectedGameMode
     */
    saveGameMode(selectedGameMode) {
      this.mode = selectedGameMode;
      switch (selectedGameMode) {
        case 0:
          this.insertion = Const.INTERVAL_INSERTION.EASY;
          this.animation = Const.INTERVAL_ANIMATION.EASY;
          break;
        case 1:
          this.insertion = Const.INTERVAL_INSERTION.NORMAL;
          this.animation = Const.INTERVAL_ANIMATION.NORMAL;
          break;
        case 2:
          this.insertion = Const.INTERVAL_INSERTION.HARD;
          this.animation = Const.INTERVAL_ANIMATION.HARD;
          break;
        default:
          // assertNever(status);
          // break;
          throw new Error(`不明なステータスです: ${selectedGameMode}`);
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
// const assertNever = (x: never) => {
//   throw new Error("This code should not be called");
// };
