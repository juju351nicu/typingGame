// @vitest-environment jsdom

import {
  formatBadge,
  useNotifications,
  type NotificationApi,
  type UseNotificationsOptions,
} from "@/composables/useNotifications";
import type { NotificationResponse } from "@/types/interfaces";
import { HttpError } from "@/utils/fetchClient";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/** 定期取得の間隔（テスト用に既定値と同じ60秒を使う） */
const INTERVAL_MS = 60_000;

/** テスト用のお知らせ */
const createNotification = (
  overrides: Partial<NotificationResponse> = {}
): NotificationResponse => ({
  id: 1,
  category: "announce",
  title: "メンテナンスのお知らせ",
  body: "10/30にメンテナンスを行います。",
  linkPath: null,
  createdAt: "2026-10-24 10:00:00",
  unread: true,
  ...overrides,
});

/**
 * 表示状態を切り替えられるdocumentを作成する。
 *
 * @param initialState 初期の表示状態
 * @returns テスト用document
 */
const createDocument = (initialState: DocumentVisibilityState = "visible") => {
  const target = new EventTarget();
  const doc = {
    visibilityState: initialState,
    addEventListener: vi.fn(target.addEventListener.bind(target)),
    removeEventListener: vi.fn(target.removeEventListener.bind(target)),
  };
  /** 表示状態を変更し、visibilitychangeを発火する。 */
  const setVisibility = (state: DocumentVisibilityState): void => {
    doc.visibilityState = state;
    target.dispatchEvent(new Event("visibilitychange"));
  };
  return { doc, setVisibility };
};

/**
 * 401エラーを作成する。
 * @returns 401のHttpError
 */
const createUnauthorizedError = (): HttpError => {
  return new HttpError(
    new Response(null, { status: 401, statusText: "Unauthorized" })
  );
};

/** テスト用のAPIモック */
const createApi = () => {
  return {
    fetchNotifications: vi
      .fn<NotificationApi["fetchNotifications"]>()
      .mockResolvedValue([createNotification()]),
    fetchUnreadCount: vi
      .fn<NotificationApi["fetchUnreadCount"]>()
      .mockResolvedValue({ announce: 3 }),
    markRead: vi.fn<NotificationApi["markRead"]>().mockResolvedValue(),
  };
};

/**
 * テスト対象のcomposableを作成する。
 *
 * @param overrides オプションの上書き
 * @returns composableの戻り値とモック
 */
const setup = (overrides: Partial<UseNotificationsOptions> = {}) => {
  const api = createApi();
  const { doc, setVisibility } = createDocument();
  const authStore = { isLoggedIn: true, clearExpiredLogin: vi.fn() };
  const notifications = useNotifications({
    authStore,
    api,
    documentRef: doc,
    pollingIntervalMs: INTERVAL_MS,
    isBackendApiEnabled: true,
    ...overrides,
  });
  return { notifications, api, doc, setVisibility, authStore };
};

describe("formatBadge", () => {
  it.each([
    [0, ""],
    [-1, ""],
    [1, "1"],
    [42, "42"],
    [99, "99"],
    [100, "99+"],
    [1000, "99+"],
  ])("%i件のバッジ表示は「%s」", (count, expected) => {
    expect(formatBadge(count)).toBe(expected);
  });
});

describe("useNotifications", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("開始時と60秒ごとに未読件数を取得する", async () => {
    const { notifications, api } = setup();

    notifications.startPolling();
    await vi.advanceTimersByTimeAsync(0);
    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(1);
    expect(notifications.unreadCount.value).toBe(3);
    expect(notifications.badgeLabel.value).toBe("3");

    await vi.advanceTimersByTimeAsync(INTERVAL_MS);
    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(2);

    notifications.stopPolling();
  });

  it("画面が非表示の間は定期取得しない", async () => {
    const { notifications, api, doc } = setup();
    doc.visibilityState = "hidden";

    notifications.startPolling();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 3);

    expect(api.fetchUnreadCount).not.toHaveBeenCalled();
    notifications.stopPolling();
  });

  it("画面が再表示されたときに未読件数を取り直す", async () => {
    const { notifications, api, doc, setVisibility } = setup();
    doc.visibilityState = "hidden";
    notifications.startPolling();

    setVisibility("visible");
    await vi.advanceTimersByTimeAsync(0);

    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(1);
    notifications.stopPolling();
  });

  it("二重に開始してもタイマーとイベントリスナーは1つだけ登録する", async () => {
    const { notifications, api, doc } = setup();
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");

    notifications.startPolling();
    notifications.startPolling();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS);

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(doc.addEventListener).toHaveBeenCalledTimes(1);
    // 開始時の1回と60秒後の1回だけ取得する。
    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(2);
    notifications.stopPolling();
  });

  it("停止するとタイマーとvisibilitychangeのリスナーを解除する", async () => {
    const { notifications, api, doc, setVisibility } = setup();
    notifications.startPolling();
    await vi.advanceTimersByTimeAsync(0);
    api.fetchUnreadCount.mockClear();

    notifications.stopPolling();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 2);
    setVisibility("visible");
    await vi.advanceTimersByTimeAsync(0);

    expect(api.fetchUnreadCount).not.toHaveBeenCalled();
    expect(doc.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function)
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it("一覧を開くと通信を待たずにバッジを0にし、既読化する", async () => {
    const { notifications, api } = setup();
    notifications.unreadCount.value = 3;
    let resolveList: (value: NotificationResponse[]) => void = () => {};
    api.fetchNotifications.mockReturnValue(
      new Promise((resolve) => {
        resolveList = resolve;
      })
    );
    api.fetchUnreadCount.mockResolvedValue({ announce: 0 });

    const opening = notifications.openNotifications();
    expect(notifications.unreadCount.value).toBe(0);
    expect(notifications.badgeLabel.value).toBe("");

    resolveList([createNotification()]);
    await opening;

    expect(api.markRead).toHaveBeenCalledWith("announce");
    expect(notifications.notifications.value).toHaveLength(1);
    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(1);
  });

  it("未読が0件の場合は既読化APIを呼ばない", async () => {
    const { notifications, api } = setup();
    notifications.unreadCount.value = 0;
    api.fetchNotifications.mockResolvedValue([
      createNotification({ unread: false }),
    ]);
    api.fetchUnreadCount.mockResolvedValue({ announce: 0 });

    await notifications.openNotifications();

    expect(api.markRead).not.toHaveBeenCalled();
  });

  it("既読化に失敗した場合はサーバーの未読件数へ表示を戻す", async () => {
    const { notifications, api } = setup();
    notifications.unreadCount.value = 2;
    api.markRead.mockRejectedValue(new Error("network"));
    api.fetchUnreadCount.mockResolvedValue({ announce: 2 });

    await notifications.openNotifications();

    expect(api.markRead).toHaveBeenCalledTimes(1);
    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(1);
    expect(notifications.unreadCount.value).toBe(2);
    expect(notifications.errorMessage.value).not.toBe("");
  });

  it("401の場合は認証切れとして扱い、定期取得を止める", async () => {
    const { notifications, api, authStore } = setup();
    api.fetchUnreadCount.mockRejectedValue(createUnauthorizedError());

    notifications.startPolling();
    await vi.advanceTimersByTimeAsync(0);

    expect(authStore.clearExpiredLogin).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);

    await vi.advanceTimersByTimeAsync(INTERVAL_MS * 2);
    expect(api.fetchUnreadCount).toHaveBeenCalledTimes(1);
  });

  it("一覧取得で401になった場合は未読件数を取り直さない", async () => {
    const { notifications, api, authStore } = setup();
    api.fetchNotifications.mockRejectedValue(createUnauthorizedError());

    await notifications.openNotifications();

    expect(authStore.clearExpiredLogin).toHaveBeenCalledTimes(1);
    expect(api.fetchUnreadCount).not.toHaveBeenCalled();
    expect(notifications.errorMessage.value).toBe("");
  });

  it("バックエンドAPIが無効な場合は何もしない", async () => {
    const { notifications, api, doc } = setup({ isBackendApiEnabled: false });

    notifications.startPolling();
    await notifications.refreshUnreadCount();
    await notifications.openNotifications();
    await vi.advanceTimersByTimeAsync(INTERVAL_MS);

    expect(api.fetchUnreadCount).not.toHaveBeenCalled();
    expect(api.fetchNotifications).not.toHaveBeenCalled();
    expect(doc.addEventListener).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
