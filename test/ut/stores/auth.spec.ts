import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("auth store", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_ENABLE_BACKEND_API", "true");
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ログインできる", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            user: {
              id: 1,
              loginEmail: "user@example.com",
            },
            accessToken: "access-token",
            tokenType: "Bearer",
            expiresIn: 3600,
          }),
          {
            status: 200,
            statusText: "OK",
          }
        )
      )
    );
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    await authStore.login({
      loginEmail: "user@example.com",
      password: "password123",
    });

    expect(authStore.isLoggedIn).toBe(true);
    expect(authStore.currentUser).toEqual({
      id: 1,
      loginEmail: "user@example.com",
    });
    expect(authStore.accessToken).toBe("access-token");
    expect(authStore.tokenType).toBe("Bearer");
    expect(authStore.expiresIn).toBe(3600);
  });

  it("登録後にログイン状態へ切り替える", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: 1,
            loginEmail: "user@example.com",
          }),
          {
            status: 201,
            statusText: "Created",
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            user: {
              id: 1,
              loginEmail: "user@example.com",
            },
            accessToken: "registered-access-token",
            tokenType: "Bearer",
            expiresIn: 3600,
          }),
          {
            status: 200,
            statusText: "OK",
          }
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    await authStore.register({
      loginEmail: "user@example.com",
      password: "password123",
    });

    expect(authStore.isLoggedIn).toBe(true);
    expect(authStore.accessToken).toBe("registered-access-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("ログイン中ユーザー取得に失敗した場合は未ログインにする", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API error")));
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    authStore.accessToken = "access-token";
    authStore.tokenType = "Bearer";
    authStore.expiresIn = 3600;

    await authStore.fetchCurrentUser();

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.currentUser).toBeNull();
    expect(authStore.accessToken).toBeNull();
  });

  it("ログアウトするとログイン状態をクリアする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 200,
          statusText: "OK",
        })
      )
    );
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    authStore.accessToken = "access-token";
    authStore.tokenType = "Bearer";
    authStore.expiresIn = 3600;

    await authStore.logout();

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.currentUser).toBeNull();
    expect(authStore.accessToken).toBeNull();
  });

  it("認証切れとしてログイン状態をクリアすると再ログイン案内を表示する", async () => {
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    authStore.accessToken = "access-token";
    authStore.tokenType = "Bearer";
    authStore.expiresIn = 3600;

    authStore.clearExpiredLogin();

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.accessToken).toBeNull();
    expect(authStore.authNotice).toEqual({
      id: 1,
      message: "ログインの有効期限が切れました。もう一度ログインしてください。",
      type: "warning",
    });
  });

  it("ログイン中ユーザー取得が401の場合は再ログイン案内を表示する", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 401,
          statusText: "Unauthorized",
        })
      )
    );
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    authStore.accessToken = "access-token";

    await authStore.fetchCurrentUser();

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.authNotice?.message).toBe(
      "ログインの有効期限が切れました。もう一度ログインしてください。"
    );
  });

  it("バックエンドAPI無効時はログインAPIを呼ばない", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_ENABLE_BACKEND_API", "false");
    setActivePinia(createPinia());
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    await authStore.login({
      loginEmail: "user@example.com",
      password: "password123",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(authStore.isLoggedIn).toBe(false);
  });
});
