import {
  fetchAdminNotificationsApi,
  fetchMyNotificationsApi,
  fetchUnreadNotificationCountApi,
  markNotificationsReadApi,
  sendAdminNotificationApi,
} from "@/services/notificationService";
import type {
  AdminNotificationResponse,
  NotificationResponse,
} from "@/types/interfaces";
import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * JSONレスポンスを返すfetchモックを作成する。
 *
 * @param body レスポンス本文
 * @param status HTTPステータス
 * @returns fetchモック
 */
const mockFetchJson = (body: unknown, status = 200) => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("notificationService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ログインユーザーのお知らせ一覧を取得する", async () => {
    const body: NotificationResponse[] = [
      {
        id: 1,
        category: "announce",
        title: "メンテナンスのお知らせ",
        body: "10/30にメンテナンスを行います。",
        linkPath: "/aboutUs",
        createdAt: "2026-10-24 10:00:00",
        unread: true,
      },
    ];
    const fetchMock = mockFetchJson(body);

    await expect(fetchMyNotificationsApi()).resolves.toEqual(body);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/notifications",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("未読件数を取得する", async () => {
    const fetchMock = mockFetchJson({ announce: 4 });

    await expect(fetchUnreadNotificationCountApi()).resolves.toEqual({
      announce: 4,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/notifications/unread-count",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("204 No Contentの既読化APIへ種類を送信する", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(markNotificationsReadApi("announce")).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/notifications/mark-read",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ category: "announce" }),
      })
    );
  });

  it("管理者としてお知らせを送信し、送信済み一覧を取得する", async () => {
    const created: AdminNotificationResponse = {
      id: 3,
      category: "announce",
      userId: null,
      title: "新機能",
      body: "ランキングを追加しました。",
      linkPath: null,
      createdAt: "2026-10-24 12:00:00",
    };
    const fetchMock = mockFetchJson(created, 201);

    await expect(
      sendAdminNotificationApi({
        title: "新機能",
        body: "ランキングを追加しました。",
        linkPath: null,
        userId: null,
      })
    ).resolves.toEqual(created);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/admin/notifications",
      expect.objectContaining({ method: "POST" })
    );

    mockFetchJson([created]);
    await expect(fetchAdminNotificationsApi()).resolves.toEqual([created]);
  });

  it("権限がない場合はHTTPエラーにする", async () => {
    mockFetchJson({ fieldErrors: [] }, 403);

    await expect(fetchAdminNotificationsApi()).rejects.toMatchObject({
      status: 403,
    });
  });
});
