import { defineStore } from "pinia";
import Const from "@/constants/const";
import type {
  Alert,
  LoginResponse,
  LoginRequest,
  LoginUser,
  RegisterUserRequest,
} from "@/types/interfaces";
import {
  fetchCurrentUserApi,
  loginApi,
  logoutApi,
  registerUserApi,
} from "@/services/authService";
import {
  clearAuthToken,
  getAuthToken,
  saveAuthToken,
} from "@/utils/authTokenStorage";
import { isUnauthorizedApiError } from "@/utils/apiErrorUtils";
import { useGameScoresStore } from "@/stores/gameScores";

/** 認証切れ時に画面上部へ表示するメッセージ */
const SESSION_EXPIRED_MESSAGE =
  "ログインの有効期限が切れました。もう一度ログインしてください。";

/**
 * 認証ストアで使用する型定義
 */
interface AuthState {
  currentUser: LoginUser | null;
  accessToken: string | null;
  tokenType: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  authNotice: Alert | null;
  authNoticeSequence: number;
}

/**
 * ログイン状態を扱うストア
 */
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => {
    // Piniaインスタンスごとに、その時点のsessionStorageから初期値を作る。
    const storedAuthToken = Const.BACKEND_API.ENABLED ? getAuthToken() : null;

    return {
      /** ログイン中ユーザー情報 */
      currentUser: null,
      /** API認証に使うアクセストークン */
      accessToken: storedAuthToken?.accessToken ?? null,
      /** アクセストークンの種別 */
      tokenType: storedAuthToken?.tokenType ?? null,
      /** アクセストークンの有効期限（Unix time、ミリ秒） */
      expiresAt: storedAuthToken?.expiresAt ?? null,
      /** ローディングフラグ */
      isLoading: false,
      /** 認証状態の変化を画面へ知らせる通知 */
      authNotice: null,
      /** 同じ通知文言でも再表示できるようにするための連番 */
      authNoticeSequence: 0,
    };
  },
  getters: {
    /**
     * ログイン済みか判定する。
     * @returns ログイン済みの場合はtrue
     */
    isLoggedIn(): boolean {
      return this.currentUser !== null;
    },
  },
  actions: {
    /**
     * sessionStorageに保存されたJWTからログイン状態を復元する。
     *
     * API無効時、保存済みJWTがない場合、すでにユーザー取得済みの場合は通信しない。
     */
    async restoreSession(): Promise<void> {
      if (!Const.BACKEND_API.ENABLED || !this.accessToken || this.currentUser) {
        return;
      }

      await this.fetchCurrentUser();
    },
    /**
     * ユーザーを登録する。
     * @param request ユーザー登録リクエスト
     */
    async register(request: RegisterUserRequest): Promise<void> {
      if (!Const.BACKEND_API.ENABLED) {
        this.currentUser = null;
        return;
      }

      this.isLoading = true;
      try {
        this.clearCurrentUser();
        await registerUserApi(request);
        const response = await loginApi(request);
        this.setLoginResponse(response);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * ログインする。
     * @param request ログインリクエスト
     */
    async login(request: LoginRequest): Promise<void> {
      if (!Const.BACKEND_API.ENABLED) {
        this.currentUser = null;
        return;
      }

      this.isLoading = true;
      try {
        this.clearCurrentUser();
        const response = await loginApi(request);
        this.setLoginResponse(response);
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * 現在のログイン状態をAPIから取得する。
     */
    async fetchCurrentUser(): Promise<void> {
      if (!Const.BACKEND_API.ENABLED) {
        this.currentUser = null;
        return;
      }

      this.isLoading = true;
      try {
        this.currentUser = await fetchCurrentUserApi();
      } catch (error) {
        if (isUnauthorizedApiError(error)) {
          this.clearExpiredLogin();
        } else {
          this.clearCurrentUser();
        }
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * ログインAPIレスポンスをFE側の認証状態へ反映する。
     * @param response ログインAPIレスポンス
     */
    setLoginResponse(response: LoginResponse): void {
      const authToken = saveAuthToken(response);
      this.currentUser = response.user;
      this.accessToken = authToken?.accessToken ?? null;
      this.tokenType = authToken?.tokenType ?? null;
      this.expiresAt = authToken?.expiresAt ?? null;
    },
    /**
     * FE側のログイン状態をクリアする。
     */
    clearCurrentUser(): void {
      this.currentUser = null;
      this.accessToken = null;
      this.tokenType = null;
      this.expiresAt = null;
      this.authNotice = null;
      clearAuthToken();
    },
    /**
     * 認証切れとしてログイン状態をクリアし、再ログイン案内を表示する。
     */
    clearExpiredLogin(): void {
      this.clearCurrentUser();
      // 同じ文言の通知でも再表示できるよう、通知ごとにidを進める。
      this.authNoticeSequence += 1;
      this.authNotice = {
        id: this.authNoticeSequence,
        message: SESSION_EXPIRED_MESSAGE,
        type: Const.ALERT_TYPE.WARNING,
      };
    },
    /**
     * 認証に関する画面通知を削除する。
     */
    clearAuthNotice(): void {
      this.authNotice = null;
    },
    /**
     * ログアウトする。
     */
    async logout(): Promise<void> {
      if (!Const.BACKEND_API.ENABLED) {
        this.currentUser = null;
        return;
      }

      this.isLoading = true;
      try {
        await logoutApi();
      } finally {
        this.clearCurrentUser();
        // APIから取得した前ユーザーのスコアを共有端末に残さない。
        useGameScoresStore().deleteGameScoreList();
        this.isLoading = false;
      }
    },
  },
});
