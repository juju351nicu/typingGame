import { defineStore } from "pinia";
import Const from "@/constants/const";
import type { GameMode, GameRule, TimeLimitSeconds } from "@/types/interfaces";
/**
 * 設定のストアで使用する型定義
 */
interface ConfigState {
  mode: GameMode;
  gameRule: GameRule;
  timeLimitSeconds: TimeLimitSeconds;
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
    mode: Const.GAME_MODE.EASY,
    /** ゲーム終了条件の種類 */
    gameRule: Const.GAME_RULE.NORMAL,
    /** タイムアタックの制限時間 */
    timeLimitSeconds: 60,
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
    getGameMode(): GameMode {
      return this.mode;
    },
    /**
     * ゲームルールを取得する
     * @returns 通常モードまたはタイムアタック
     */
    getGameRule(): GameRule {
      return this.gameRule;
    },
    /**
     * タイムアタックの制限時間を取得する
     * @returns 制限時間（秒）
     */
    getTimeLimitSeconds(): TimeLimitSeconds {
      return this.timeLimitSeconds;
    },
    /**
     * タイムアタックが選択されているか
     * @returns タイムアタックの場合 true
     */
    getIsTimeAttackMode(): boolean {
      return this.gameRule === Const.GAME_RULE.TIME_ATTACK;
    },
    /**
     * ダークモード等のディスプレイの値
     * @returns ダークモードの場合 true
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
     * @param selectedGameMode ゲーム難易度
     */
    saveGameMode(selectedGameMode: GameMode) {
      this.mode = selectedGameMode;
      switch (selectedGameMode) {
        case Const.GAME_MODE.EASY:
          this.insertion = Const.INTERVAL_INSERTION.EASY;
          this.animation = Const.INTERVAL_ANIMATION.EASY;
          break;
        case Const.GAME_MODE.NORMAL:
          this.insertion = Const.INTERVAL_INSERTION.NORMAL;
          this.animation = Const.INTERVAL_ANIMATION.NORMAL;
          break;
        case Const.GAME_MODE.HARD:
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
     * ゲームルールを設定する
     * @param selectedGameRule ゲームルール
     */
    saveGameRule(selectedGameRule: GameRule) {
      this.gameRule = selectedGameRule;
    },
    /**
     * タイムアタックの制限時間を設定する
     * @param selectedTimeLimitSeconds 制限時間（秒）
     */
    saveTimeLimitSeconds(selectedTimeLimitSeconds: TimeLimitSeconds) {
      this.timeLimitSeconds = selectedTimeLimitSeconds;
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
    saveIsVirtualKeyboard(flag: boolean) {
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
