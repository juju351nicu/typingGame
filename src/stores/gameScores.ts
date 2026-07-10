import { defineStore } from "pinia";
import Const from "@/constants/const";
import type { GameScore } from "@/types/interfaces";
import {
  deleteGameScores,
  fetchMyGameScoresApi,
  saveGameScore,
  saveMyGameScoreApi,
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
    isLoading: false,
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
      if (!Const.BACKEND_API.ENABLED || !authStore.isLoggedIn) {
        return;
      }

      try {
        await saveMyGameScoreApi(data);
      } catch {
        // API保存に失敗してもlocalStorage保存済みのプレイ結果は維持する。
      }
    },
    /**
     * ログインユーザーのスコア一覧をAPIから取得する。
     *
     * バックエンドAPIが無効、または未ログインの場合は何もしない。
     * API取得に失敗した場合も、localStorageから復元済みのスコアは維持する。
     */
    async loadMyGameScoresIfAvailable(): Promise<void> {
      const authStore = useAuthStore();
      if (!Const.BACKEND_API.ENABLED || !authStore.isLoggedIn) {
        this.isLoading = false;
        return;
      }

      this.isLoading = true;
      try {
        this.scores = await fetchMyGameScoresApi();
      } catch {
        // API取得に失敗してもlocalStorageから復元済みのスコアは維持する。
      } finally {
        this.isLoading = false;
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
