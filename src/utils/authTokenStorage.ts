import type { LoginResponse } from "@/types/interfaces";

/** 認証トークンをsessionStorageへ保存するときのキー */
const AUTH_TOKEN_STORAGE_KEY = "typingGame.authToken";

/** 保存する認証トークン情報 */
export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt?: number;
}

/**
 * sessionStorageを安全に取得する。
 *
 * @returns 利用可能なsessionStorage。利用できない場合はnull
 */
const getSessionStorage = (): Storage | null => {
  try {
    if (typeof sessionStorage === "undefined") {
      return null;
    }
    return sessionStorage;
  } catch {
    return null;
  }
};

/**
 * ログインレスポンスから認証トークンを保存する。
 *
 * @param response ログインAPIレスポンス
 * @returns 保存した認証トークン。トークンがない場合はnull
 */
export const saveAuthToken = (response: LoginResponse): AuthToken | null => {
  if (!response.accessToken) {
    clearAuthToken();
    return null;
  }

  const authToken: AuthToken = {
    accessToken: response.accessToken,
    tokenType: response.tokenType ?? "Bearer",
    expiresAt:
      typeof response.expiresIn === "number" && response.expiresIn > 0
        ? Date.now() + response.expiresIn * 1000
        : undefined,
  };

  getSessionStorage()?.setItem(
    AUTH_TOKEN_STORAGE_KEY,
    JSON.stringify(authToken)
  );
  return authToken;
};

/**
 * 保存済みの認証トークンを取得する。
 *
 * @returns 保存済み認証トークン。未保存または不正な場合はnull
 */
export const getAuthToken = (): AuthToken | null => {
  const storage = getSessionStorage();
  const storedValue = storage?.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<AuthToken>;
    if (
      typeof parsedValue.accessToken !== "string" ||
      parsedValue.accessToken.length === 0
    ) {
      clearAuthToken();
      return null;
    }

    if (
      parsedValue.expiresAt !== undefined &&
      (!Number.isFinite(parsedValue.expiresAt) ||
        parsedValue.expiresAt <= Date.now())
    ) {
      clearAuthToken();
      return null;
    }

    return {
      accessToken: parsedValue.accessToken,
      tokenType:
        typeof parsedValue.tokenType === "string"
          ? parsedValue.tokenType
          : "Bearer",
      expiresAt: parsedValue.expiresAt,
    };
  } catch {
    clearAuthToken();
    return null;
  }
};

/**
 * Authorizationヘッダーに設定する値を取得する。
 *
 * @returns Authorizationヘッダー値。未ログインの場合はnull
 */
export const getAuthorizationHeaderValue = (): string | null => {
  const authToken = getAuthToken();
  if (!authToken) {
    return null;
  }
  return `${authToken.tokenType} ${authToken.accessToken}`;
};

/**
 * 保存済みの認証トークンを削除する。
 */
export const clearAuthToken = (): void => {
  getSessionStorage()?.removeItem(AUTH_TOKEN_STORAGE_KEY);
};
