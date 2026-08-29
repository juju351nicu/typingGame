import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createMemoryStorage = (initialValues: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(initialValues));
  return {
    get length() {
      return store.size;
    },
    clear: vi.fn(() => store.clear()),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  } satisfies Storage;
};

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

  it("保存済みJWTがある場合はログイン中ユーザーを復元する", async () => {
    vi.stubGlobal(
      "sessionStorage",
      createMemoryStorage({
        "typingGame.authToken": JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
          expiresIn: 3600,
        }),
      })
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          loginEmail: "user@example.com",
        }),
        {
          status: 200,
          statusText: "OK",
        }
      )
    );
    vi.stubGlobal(
      "fetch",
      fetchMock
    );
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    await authStore.restoreSession();

    expect(authStore.currentUser).toEqual({
      id: 1,
      loginEmail: "user@example.com",
    });
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer access-token");
  });

  it("保存済みJWTがない場合はログイン状態の復元APIを呼ばない", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();

    await authStore.restoreSession();

    expect(fetchMock).not.toHaveBeenCalled();
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
