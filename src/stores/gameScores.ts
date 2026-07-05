import { defineStore } from "pinia";
import type { GameScore } from "@/types/interfaces";
import {
  deleteGameScores,
  saveGameScore,
  saveGameScoreApi,
} from "@/services/scoreService";
import { useAuthStore } from "@/stores/auth";
/**
 * ゲームスコアのストアで使用する型定義
 */
interface GameScoresState {
  scores: GameScore[];
  isLoading: boolean;
}
/**
 * ゲームスコアのストア
 */
export const useGameScoresStore = defineStore("gameScores", {
  state: (): GameScoresState => ({
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
    getGameScoreList(): GameScore[] {
      return this.scores;
    },
  },
  actions: {
    /**
     * 難易度・スコア・タイマーのオブジェクトを保存する。
     * @param data ゲームスコア
     */
    async saveGameScoreList(data: GameScore): Promise<void> {
      this.scores = saveGameScore(this.scores, data);

      const authStore = useAuthStore();
      if (!authStore.isLoggedIn) {
        return;
      }

      try {
        await saveGameScoreApi(data);
      } catch {
        // API保存に失敗してもlocalStorage保存済みのプレイ結果は維持する。
      }
    },
    /**
     * ストレージにあるスコア情報を削除する。
     */
    deleteGameScoreList() {
      this.scores = deleteGameScores();
    },
  },
  // LocalStorageに保存する場合
  persist: {
    storage: localStorage,
  },
});
