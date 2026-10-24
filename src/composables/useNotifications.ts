import { computed, ref, type ComputedRef, type Ref } from "vue";
import Const from "@/constants/const";
import {
  fetchMyNotificationsApi,
  fetchUnreadNotificationCountApi,
  markNotificationsReadApi,
} from "@/services/notificationService";
import {
  isUnauthorizedApiError,
  toDisplayFieldErrors,
} from "@/utils/apiErrorUtils";
import type {
  NotificationCategory,
  NotificationResponse,
  NotificationUnreadCountResponse,
} from "@/types/interfaces";

type IntervalId = ReturnType<typeof setInterval>;

/** お知らせ機能が参照する認証ストアの最小インターフェース */
interface NotificationAuthStore {
  /** ログイン済みか */
  isLoggedIn: boolean;
  /** 認証切れとしてログイン状態をクリアし、再ログイン案内を表示する */
  clearExpiredLogin: () => void;
}

/** お知らせAPIの呼び出し。テストではモックへ差し替える */
export interface NotificationApi {
  fetchNotifications: () => Promise<NotificationResponse[]>;
  fetchUnreadCount: () => Promise<NotificationUnreadCountResponse>;
  markRead: (category: NotificationCategory) => Promise<void>;
}

/** useNotifications のオプション */
export interface UseNotificationsOptions {
  /** 認証状態を持つストア */
  authStore: NotificationAuthStore;
  /** お知らせAPI。未指定の場合はnotificationServiceを使う */
  api?: NotificationApi;
  /** 未読件数を再取得する間隔（ミリ秒） */
  pollingIntervalMs?: number;
  /** 表示状態の判定に使うdocument。テストで差し替える */
  documentRef?: Pick<
    Document,
    "visibilityState" | "addEventListener" | "removeEventListener"
  >;
  /** バックエンドAPIを使うか。未指定の場合はVITE_ENABLE_BACKEND_APIに従う */
  isBackendApiEnabled?: boolean;
}

/** useNotifications の戻り値 */
export interface UseNotificationsReturn {
  /** 取得済みのお知らせ一覧 */
  notifications: Ref<NotificationResponse[]>;
  /** 未読件数 */
  unreadCount: Ref<number>;
  /** 未読バッジに表示する文字列。0件の場合は空文字 */
  badgeLabel: ComputedRef<string>;
  /** お知らせ一覧を取得中か */
  isLoading: Ref<boolean>;
  /** お知らせ一覧の取得に失敗した場合のメッセージ */
  errorMessage: Ref<string>;
  /** 定期取得を開始する */
  startPolling: () => void;
  /** 定期取得を停止する */
  stopPolling: () => void;
  /** 未読件数を再取得する */
  refreshUnreadCount: () => Promise<void>;
  /** お知らせ一覧を開き、未読があれば既読にする */
  openNotifications: () => Promise<void>;
}

/** 既定のお知らせAPI */
const defaultNotificationApi: NotificationApi = {
  fetchNotifications: fetchMyNotificationsApi,
  fetchUnreadCount: fetchUnreadNotificationCountApi,
  markRead: markNotificationsReadApi,
};

/**
 * 未読件数をバッジ表示用の文字列へ変換する。
 *
 * @param count 未読件数
 * @returns 0件以下は空文字、1〜99件は件数、100件以上は「99+」
 */
export const formatBadge = (count: number): string => {
  if (!Number.isFinite(count) || count <= 0) {
    return "";
  }
  if (count > Const.NOTIFICATION.BADGE_MAX_COUNT) {
    return `${Const.NOTIFICATION.BADGE_MAX_COUNT}+`;
  }
  return String(Math.floor(count));
};

/**
 * ヘッダーのお知らせ（未読バッジと一覧）の状態を管理する。
 *
 * ライフサイクルフックは持たず、呼び出し側（TheHeader.vue）が
 * マウント・ログイン時に startPolling、アンマウント・ログアウト時に stopPolling を呼ぶ。
 * 未読件数は画面が表示されている間だけ一定間隔で再取得する。
 *
 * @param options 認証ストアやAPIの差し替え設定
 * @returns お知らせの状態と操作
 */
export const useNotifications = (
  options: UseNotificationsOptions
): UseNotificationsReturn => {
  const api = options.api ?? defaultNotificationApi;
  const pollingIntervalMs =
    options.pollingIntervalMs ?? Const.NOTIFICATION.POLLING_INTERVAL_MS;
  const isBackendApiEnabled =
    options.isBackendApiEnabled ?? Const.BACKEND_API.ENABLED;
  const category = Const.NOTIFICATION_CATEGORY.ANNOUNCE;

  const notifications = ref<NotificationResponse[]>([]);
  const unreadCount = ref(0);
  const isLoading = ref(false);
  const errorMessage = ref("");

  /** 定期取得のタイマー。停止中はnull */
  let pollingTimerId: IntervalId | null = null;

  const badgeLabel = computed((): string => formatBadge(unreadCount.value));

  /** documentを取得する。SSRやテスト環境でdocumentがない場合はnull */
  const getDocument = (): UseNotificationsOptions["documentRef"] | null => {
    if (options.documentRef) {
      return options.documentRef;
    }
    return typeof document === "undefined" ? null : document;
  };

  /** 画面が表示中か */
  const isDocumentVisible = (): boolean => {
    return getDocument()?.visibilityState === "visible";
  };

  /** API呼び出しをしてよい状態か */
  const canUseApi = (): boolean => {
    return isBackendApiEnabled && options.authStore.isLoggedIn;
  };

  /**
   * 401エラーを処理する。
   *
   * 認証切れの場合は共通の再ログイン案内を出し、以降の定期取得を止める。
   *
   * @param error 発生した例外
   * @returns 401エラーとして処理した場合はtrue
   */
  const handleUnauthorized = (error: unknown): boolean => {
    if (!isUnauthorizedApiError(error)) {
      return false;
    }
    stopPolling();
    options.authStore.clearExpiredLogin();
    return true;
  };

  const refreshUnreadCount = async (): Promise<void> => {
    if (!canUseApi()) {
      return;
    }

    try {
      const response = await api.fetchUnreadCount();
      unreadCount.value = response[category] ?? 0;
    } catch (error) {
      // 一時的な通信失敗では表示中の件数を維持し、次回の定期取得で再試行する。
      handleUnauthorized(error);
    }
  };

  /** 画面が再表示されたときに未読件数を最新にする。 */
  const handleVisibilityChange = (): void => {
    if (isDocumentVisible()) {
      void refreshUnreadCount();
    }
  };

  const stopPolling = (): void => {
    if (pollingTimerId !== null) {
      clearInterval(pollingTimerId);
      pollingTimerId = null;
    }
    getDocument()?.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };

  const startPolling = (): void => {
    // 二重起動するとタイマーとイベントリスナーが重複するため、起動済みなら何もしない。
    if (!isBackendApiEnabled || pollingTimerId !== null) {
      return;
    }

    getDocument()?.addEventListener("visibilitychange", handleVisibilityChange);
    pollingTimerId = setInterval(() => {
      // 非表示のタブではAPIを呼ばず、再表示時のvisibilitychangeで取り直す。
      if (isDocumentVisible()) {
        void refreshUnreadCount();
      }
    }, pollingIntervalMs);

    if (isDocumentVisible()) {
      void refreshUnreadCount();
    }
  };

  const openNotifications = async (): Promise<void> => {
    if (!canUseApi()) {
      return;
    }

    const hadUnreadBadge = unreadCount.value > 0;
    // 一覧を開いた時点で既読になる扱いのため、通信を待たずにバッジを消す。
    unreadCount.value = 0;
    isLoading.value = true;
    errorMessage.value = "";
    let isUnauthorized = false;

    try {
      notifications.value = await api.fetchNotifications();
      const hasUnread =
        hadUnreadBadge ||
        notifications.value.some((notification) => notification.unread);
      if (hasUnread) {
        await api.markRead(category);
      }
    } catch (error) {
      isUnauthorized = handleUnauthorized(error);
      if (!isUnauthorized) {
        errorMessage.value = toDisplayFieldErrors(error, {
          defaultMessage: "お知らせを取得できませんでした。",
        })[0].message;
      }
    } finally {
      isLoading.value = false;
      // 既読化に失敗した場合も、サーバー上の未読件数へ表示を戻す。
      if (!isUnauthorized) {
        await refreshUnreadCount();
      }
    }
  };

  return {
    notifications,
    unreadCount,
    badgeLabel,
    isLoading,
    errorMessage,
    startPolling,
    stopPolling,
    refreshUnreadCount,
    openNotifications,
  };
};
