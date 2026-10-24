import type {
  AdminNotificationRequest,
  AdminNotificationResponse,
  NotificationCategory,
  NotificationMarkReadRequest,
  NotificationResponse,
  NotificationUnreadCountResponse,
} from "@/types/interfaces";
import Const from "@/constants/const";
import Fetcher from "@/utils/fetchClient";

const MY_NOTIFICATIONS_API_PATH = "/api/me/notifications";
const MY_NOTIFICATIONS_UNREAD_COUNT_API_PATH =
  "/api/me/notifications/unread-count";
const MY_NOTIFICATIONS_MARK_READ_API_PATH = "/api/me/notifications/mark-read";
const ADMIN_NOTIFICATIONS_API_PATH = "/api/admin/notifications";

/**
 * APIのURLを作成する。
 * @param path APIパス
 * @returns API URL
 */
const createApiUrl = (path: string): string => {
  return `${Const.BACKEND_API.BASE_URL}${path}`;
};

/**
 * ログインユーザー向けのお知らせ一覧を取得する。
 *
 * 一覧の取得だけでは既読にならないため、既読化は markNotificationsReadApi で行う。
 *
 * @returns 新しい順のお知らせ一覧（最大50件、直近30日分）
 */
export const fetchMyNotificationsApi = async (): Promise<
  NotificationResponse[]
> => {
  return Fetcher.getJson<NotificationResponse[]>(
    createApiUrl(MY_NOTIFICATIONS_API_PATH)
  );
};

/**
 * ログインユーザーの未読お知らせ件数を取得する。
 * @returns お知らせの種類ごとの未読件数
 */
export const fetchUnreadNotificationCountApi =
  async (): Promise<NotificationUnreadCountResponse> => {
    return Fetcher.getJson<NotificationUnreadCountResponse>(
      createApiUrl(MY_NOTIFICATIONS_UNREAD_COUNT_API_PATH)
    );
  };

/**
 * 指定した種類のお知らせをすべて既読にする。
 *
 * APIは204 No Contentを返すため、レスポンス本文は読み取らない。
 *
 * @param category 既読にするお知らせの種類
 */
export const markNotificationsReadApi = async (
  category: NotificationCategory
): Promise<void> => {
  const request: NotificationMarkReadRequest = { category };
  await Fetcher.postRequest(
    createApiUrl(MY_NOTIFICATIONS_MARK_READ_API_PATH),
    request
  );
};

/**
 * 管理者としてお知らせを送信する。
 * @param request 送信するお知らせ
 * @returns 作成されたお知らせ
 */
export const sendAdminNotificationApi = async (
  request: AdminNotificationRequest
): Promise<AdminNotificationResponse> => {
  return Fetcher.postJson<AdminNotificationResponse>(
    createApiUrl(ADMIN_NOTIFICATIONS_API_PATH),
    request
  );
};

/**
 * 管理者が送信したお知らせ一覧を取得する。
 * @returns 新しい順の送信済みお知らせ一覧（最大50件）
 */
export const fetchAdminNotificationsApi = async (): Promise<
  AdminNotificationResponse[]
> => {
  return Fetcher.getJson<AdminNotificationResponse[]>(
    createApiUrl(ADMIN_NOTIFICATIONS_API_PATH)
  );
};
