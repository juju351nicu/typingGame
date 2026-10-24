import {
  getAdminNotificationTargetLabel,
  useAdminNotificationsPageState,
  type AdminNotificationsApi,
} from "@/composables/useAdminNotificationsPageState";
import type { AdminNotificationResponse } from "@/types/interfaces";
import { HttpError } from "@/utils/fetchClient";
import { describe, expect, it, vi } from "vitest";

/** テスト用の送信済みお知らせ */
const created: AdminNotificationResponse = {
  id: 3,
  category: "announce",
  userId: 12,
  title: "新機能",
  body: "ランキングを追加しました。",
  linkPath: "/scoresBoard",
  createdAt: "2026-10-24 12:00:00",
};

/**
 * HTTPエラーを作成する。
 *
 * @param status HTTPステータス
 * @param body エラーレスポンス本文
 * @returns HttpError
 */
const createHttpError = (status: number, body?: object): HttpError => {
  return new HttpError(new Response(null, { status }), body);
};

/** テスト用のAPIモックと画面状態を作成する。 */
const setup = () => {
  const api = {
    fetchNotifications: vi
      .fn<AdminNotificationsApi["fetchNotifications"]>()
      .mockResolvedValue([]),
    sendNotification: vi
      .fn<AdminNotificationsApi["sendNotification"]>()
      .mockResolvedValue(created),
  };
  const authStore = { clearExpiredLogin: vi.fn() };
  const state = useAdminNotificationsPageState(authStore, api);
  return { api, authStore, state };
};

describe("useAdminNotificationsPageState", () => {
  it("送信先の表示名を作成する", () => {
    expect(getAdminNotificationTargetLabel({ userId: null })).toBe(
      "全ユーザー"
    );
    expect(getAdminNotificationTargetLabel({ userId: 5 })).toBe(
      "ユーザーID: 5"
    );
  });

  it("入力エラーがある場合は送信しない", async () => {
    const { api, state } = setup();

    await state.submit();

    expect(api.sendNotification).not.toHaveBeenCalled();
    expect(state.errors.value.title).toBeDefined();
  });

  it("送信に成功したらフォームを空にし、一覧の先頭へ追加して成功通知を出す", async () => {
    const { api, state } = setup();
    state.form.title = "新機能";
    state.form.body = "ランキングを追加しました。";
    state.form.linkPath = "/scoresBoard";
    state.form.target = "user";
    state.form.userId = "12";

    await state.submit();

    expect(api.sendNotification).toHaveBeenCalledWith({
      title: "新機能",
      body: "ランキングを追加しました。",
      linkPath: "/scoresBoard",
      userId: 12,
    });
    expect(state.sentNotifications.value[0]).toEqual(created);
    expect(state.form.title).toBe("");
    expect(state.alerts.value.at(-1)).toMatchObject({ type: "success" });
  });

  it("BEの入力チェックエラーは該当項目の下に表示する", async () => {
    const { api, state } = setup();
    state.form.title = "新機能";
    state.form.body = "本文";
    api.sendNotification.mockRejectedValue(
      createHttpError(400, {
        fieldErrors: [
          { field: "title", message: "タイトルが重複しています。" },
        ],
      })
    );

    await state.submit();

    expect(state.errors.value.title).toBe("タイトルが重複しています。");
    expect(state.alerts.value).toHaveLength(0);
  });

  it("403の場合は権限がない旨を通知し、401の場合は認証切れとして扱う", async () => {
    const { api, authStore, state } = setup();
    api.fetchNotifications.mockRejectedValueOnce(createHttpError(403));
    await state.loadSentNotifications();
    expect(state.alerts.value.at(-1)?.message).toBe(
      "お知らせを管理する権限がありません。"
    );

    api.fetchNotifications.mockRejectedValueOnce(createHttpError(401));
    await state.loadSentNotifications();
    expect(authStore.clearExpiredLogin).toHaveBeenCalledTimes(1);
  });
});
