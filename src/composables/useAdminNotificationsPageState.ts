import { ref } from "vue";
import Const from "@/constants/const";
import {
  useAdminNotificationForm,
  type AdminNotificationForm,
  type AdminNotificationFormErrors,
} from "@/composables/useAdminNotificationForm";
import {
  fetchAdminNotificationsApi,
  sendAdminNotificationApi,
} from "@/services/notificationService";
import {
  isForbiddenApiError,
  isUnauthorizedApiError,
  toDisplayFieldErrors,
} from "@/utils/apiErrorUtils";
import type {
  AdminNotificationRequest,
  AdminNotificationResponse,
  Alert,
} from "@/types/interfaces";

/** 権限不足時に表示するメッセージ */
const FORBIDDEN_MESSAGE = "お知らせを管理する権限がありません。";

/** お知らせ管理画面が参照する認証ストアの最小インターフェース */
interface AdminNotificationsAuthStore {
  /** 認証切れとしてログイン状態をクリアし、再ログイン案内を表示する */
  clearExpiredLogin: () => void;
}

/** お知らせ管理APIの呼び出し。テストではモックへ差し替える */
export interface AdminNotificationsApi {
  fetchNotifications: () => Promise<AdminNotificationResponse[]>;
  sendNotification: (
    request: AdminNotificationRequest
  ) => Promise<AdminNotificationResponse>;
}

/** 既定のお知らせ管理API */
const defaultAdminNotificationsApi: AdminNotificationsApi = {
  fetchNotifications: fetchAdminNotificationsApi,
  sendNotification: sendAdminNotificationApi,
};

/**
 * 送信先の表示名を取得する。
 *
 * @param notification 送信済みお知らせ
 * @returns 全ユーザー宛て、またはユーザーID
 */
export const getAdminNotificationTargetLabel = (
  notification: Pick<AdminNotificationResponse, "userId">
): string => {
  return notification.userId === null
    ? "全ユーザー"
    : `ユーザーID: ${notification.userId}`;
};

/**
 * お知らせ管理画面の送信フォーム・送信済み一覧・通知を管理する。
 *
 * @param authStore 認証切れ時の処理を持つストア
 * @param api お知らせ管理API。未指定の場合はnotificationServiceを使う
 * @returns 画面で使う状態と操作
 */
export const useAdminNotificationsPageState = (
  authStore: AdminNotificationsAuthStore,
  api: AdminNotificationsApi = defaultAdminNotificationsApi
) => {
  const { form, errors, isUserTarget, validate, reset, toRequest } =
    useAdminNotificationForm();

  /** 送信済みお知らせ一覧 */
  const sentNotifications = ref<AdminNotificationResponse[]>([]);
  /** 送信済み一覧を取得中か */
  const isListLoading = ref(false);
  /** 送信中か */
  const isSending = ref(false);
  /** 画面上部に表示する通知 */
  const alerts = ref<Alert[]>([]);
  /** 同じ文言の通知でも再表示できるようにするための連番 */
  let alertSequence = 0;

  /**
   * 画面上部の通知を追加する。
   *
   * @param message 表示する文言
   * @param type 通知の種類
   */
  const pushAlert = (message: string, type: Alert["type"]): void => {
    alertSequence += 1;
    alerts.value = [...alerts.value, { id: alertSequence, message, type }];
  };

  /**
   * APIエラーを画面表示へ反映する。
   *
   * @param error 発生した例外
   */
  const handleApiError = (error: unknown): void => {
    if (isUnauthorizedApiError(error)) {
      // 再ログイン案内はアプリ共通の通知で表示する。
      authStore.clearExpiredLogin();
      return;
    }
    if (isForbiddenApiError(error)) {
      pushAlert(FORBIDDEN_MESSAGE, Const.ALERT_TYPE.ERROR);
      return;
    }
    const nextErrors: AdminNotificationFormErrors = {};
    for (const fieldError of toDisplayFieldErrors(error)) {
      // BEの入力チェックエラーは該当する入力欄の下に、それ以外は画面上部に表示する。
      if (fieldError.field && fieldError.field in form) {
        nextErrors[fieldError.field as keyof AdminNotificationForm] =
          fieldError.message;
      } else {
        pushAlert(fieldError.message, Const.ALERT_TYPE.ERROR);
      }
    }
    errors.value = nextErrors;
  };

  /**
   * 送信済みお知らせ一覧を取得する。
   *
   * API無効時はrouterでこの画面へ入れないため、ここでは有効判定を重ねない。
   */
  const loadSentNotifications = async (): Promise<void> => {
    isListLoading.value = true;
    try {
      sentNotifications.value = await api.fetchNotifications();
    } catch (error) {
      handleApiError(error);
    } finally {
      isListLoading.value = false;
    }
  };

  /**
   * 入力内容を検証してお知らせを送信する。
   *
   * 送信に成功した場合はフォームを空にし、送信済み一覧の先頭へ追加する。
   */
  const submit = async (): Promise<void> => {
    if (!validate() || isSending.value) {
      return;
    }
    isSending.value = true;
    try {
      const created = await api.sendNotification(toRequest());
      sentNotifications.value = [created, ...sentNotifications.value];
      reset();
      pushAlert("お知らせを送信しました。", Const.ALERT_TYPE.SUCCESS);
    } catch (error) {
      handleApiError(error);
    } finally {
      isSending.value = false;
    }
  };

  return {
    alerts,
    errors,
    form,
    isListLoading,
    isSending,
    isUserTarget,
    loadSentNotifications,
    sentNotifications,
    submit,
  };
};
