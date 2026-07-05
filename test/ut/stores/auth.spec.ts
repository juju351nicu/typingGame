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

    await authStore.fetchCurrentUser();

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.currentUser).toBeNull();
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

    await authStore.logout();

    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.currentUser).toBeNull();
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
