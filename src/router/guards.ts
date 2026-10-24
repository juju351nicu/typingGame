import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";

/** 画面遷移の権限判定に使う認証ストアの最小インターフェース */
export interface RouteGuardAuthStore {
  /** 管理者としてログインしているか */
  isAdmin: boolean;
  /** sessionStorageのJWTからログイン状態を復元する */
  restoreSession: () => Promise<void>;
}

/** 画面遷移の権限判定オプション */
export interface RouteAccessOptions {
  /** バックエンドAPIを使うか */
  isBackendApiEnabled: boolean;
  /** 管理者判定が必要な場合だけ認証ストアを取得する */
  getAuthStore: () => RouteGuardAuthStore;
}

/** 権限がない場合の遷移先 */
const FALLBACK_ROUTE: RouteLocationRaw = { name: "GamePage" };

/**
 * 遷移先の画面へ入れるか判定する。
 *
 * - バックエンドAPIが必要な画面は、API無効時にゲーム画面へ戻す。
 * - 管理者専用の画面は、ページ再読み込み直後でもログイン状態を復元してから判定する。
 *
 * @param to 遷移先ルート
 * @param options API有効フラグと認証ストアの取得処理
 * @returns 遷移できる場合はtrue、できない場合はリダイレクト先
 */
export const resolveRouteAccess = async (
  to: Pick<RouteLocationNormalized, "meta">,
  options: RouteAccessOptions
): Promise<true | RouteLocationRaw> => {
  if (to.meta.requiresBackendApi && !options.isBackendApiEnabled) {
    return FALLBACK_ROUTE;
  }

  if (to.meta.requiresAdmin) {
    const authStore = options.getAuthStore();
    await authStore.restoreSession();
    if (!authStore.isAdmin) {
      return FALLBACK_ROUTE;
    }
  }

  return true;
};
