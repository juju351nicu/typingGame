import { defineStore } from "pinia";
import type {
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

/**
 * 認証ストアで使用する型定義
 */
interface AuthState {
  currentUser: LoginUser | null;
  isLoading: boolean;
}

/**
 * ログイン状態を扱うストア
 */
export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    /** ログイン中ユーザー情報 */
    currentUser: null,
    /** ローディングフラグ */
    isLoading: false,
  }),
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
     * ユーザーを登録する。
     * @param request ユーザー登録リクエスト
     */
    async register(request: RegisterUserRequest): Promise<void> {
      this.isLoading = true;
      try {
        await registerUserApi(request);
        const response = await loginApi(request);
        this.currentUser = response.user;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * ログインする。
     * @param request ログインリクエスト
     */
    async login(request: LoginRequest): Promise<void> {
      this.isLoading = true;
      try {
        const response = await loginApi(request);
        this.currentUser = response.user;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * 現在のログイン状態をAPIから取得する。
     */
    async fetchCurrentUser(): Promise<void> {
      this.isLoading = true;
      try {
        this.currentUser = await fetchCurrentUserApi();
      } catch {
        this.currentUser = null;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * FE側のログイン状態をクリアする。
     */
    clearCurrentUser(): void {
      this.currentUser = null;
    },
    /**
     * ログアウトする。
     */
    async logout(): Promise<void> {
      this.isLoading = true;
      try {
        await logoutApi();
      } finally {
        this.currentUser = null;
        this.isLoading = false;
      }
    },
  },
});
