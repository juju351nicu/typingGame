import { defineStore } from "pinia";
import Const from "@/constants/const";
/**
 * 設定のストアで使用する型定義
 */
interface ConfigState {
  mode: number;
  isDarkMode: boolean;
  isVirtualKeyBoard: boolean;
  wordStyleWidth: number;
  insertion: number;
  animation: number;
}
/**
 * 設定のストア
 */
export const useConfigStore = defineStore("config", {
  state: (): ConfigState => ({
    /** ゲームの難易度 */
    mode: 0,
    /** ディスプレイモードの値 */
    isDarkMode: false,
    /** 仮想キーボードの表示有無 */
    isVirtualKeyBoard: false,
    wordStyleWidth: 200,
    insertion: 0,
    animation: 0,
  }),
  getters: {
    /**
     * ゲームの難易度を取得する
     * @returns 難易度の数値
     */
    getGameMode(): number {
      return this.mode;
    },
    /**
     * ダークモード等のディスプレイの値
     * @returns 'light'か'dark'モード
     */
    getDisplayMode(): boolean {
      return this.isDarkMode;
    },
    /**
     * 仮想キーボードの表示有無を取得する
     * @returns 仮想キーボードの表示・非表示の判定結果
     */
    getIsVirtualKeyBoard(): boolean {
      return this.isVirtualKeyBoard;
    },
    /**
     * 単語の幅のCSS長さ
     * @returns CSSのwidth
     */
    getWordStyleWidth(): number {
      return this.wordStyleWidth;
    },
    getInsertionSpeed(): number {
      return this.insertion;
    },
    getAnimationSpeed(): number {
      return this.animation;
    },
  },
  actions: {
    /**
     *
     * @param {number} selectedGameMode
     */
    saveGameMode(selectedGameMode: number) {
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
    /**
     * ディスプレイモードの値を設定する
     * @param {boolean} flag ディスプレイモードの値
     */
    saveDisplayMode(flag: boolean) {
      this.isDarkMode = flag;
    },
    /**
     * 仮想キーボードの表示有無を設定する
     * @param {boolean} flag 仮想キーボードの表示有無
     */
    saveIsVertualKeyBoard(flag: boolean) {
      this.isVirtualKeyBoard = flag;
    },
    /**
     * 単語を表示するインターバルをクリアする
     */
    resetIntervalSettings(): void {
      this.insertion = 0;
      this.animation = 0;
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
