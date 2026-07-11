import {
  clearAuthToken,
  getAuthToken,
  getAuthorizationHeaderValue,
  saveAuthToken,
} from "@/utils/authTokenStorage";
import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("authTokenStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ログインレスポンスのtokenをsessionStorageへ保存する", () => {
    const sessionStorageMock = createMemoryStorage();
    vi.stubGlobal("sessionStorage", sessionStorageMock);

    const result = saveAuthToken({
      user: {
        id: 1,
        loginEmail: "user@example.com",
      },
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 3600,
    });

    expect(result).toEqual({
      accessToken: "access-token",
      tokenType: "Bearer",
      expiresIn: 3600,
    });
    expect(getAuthToken()).toEqual(result);
  });

  it("Authorizationヘッダー値を返す", () => {
    vi.stubGlobal(
      "sessionStorage",
      createMemoryStorage({
        "typingGame.authToken": JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
        }),
      })
    );

    expect(getAuthorizationHeaderValue()).toBe("Bearer access-token");
  });

  it("不正な保存値の場合はtokenを削除してnullを返す", () => {
    const sessionStorageMock = createMemoryStorage({
      "typingGame.authToken": "{",
    });
    vi.stubGlobal("sessionStorage", sessionStorageMock);

    expect(getAuthToken()).toBeNull();
    expect(sessionStorageMock.removeItem).toHaveBeenCalledWith(
      "typingGame.authToken"
    );
  });

  it("tokenを削除する", () => {
    const sessionStorageMock = createMemoryStorage({
      "typingGame.authToken": JSON.stringify({
        accessToken: "access-token",
        tokenType: "Bearer",
      }),
    });
    vi.stubGlobal("sessionStorage", sessionStorageMock);

    clearAuthToken();

    expect(getAuthToken()).toBeNull();
  });
});
