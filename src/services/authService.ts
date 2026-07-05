import type {
  LoginRequest,
  LoginResponse,
  LoginUser,
  RegisterUserRequest,
} from "@/types/interfaces";
import Fetcher from "@/utils/fetchClient";

const DEFAULT_API_BASE_URL = "http://localhost:8091";
const USERS_API_PATH = "/api/users";
const LOGIN_API_PATH = "/api/auth/login";
const LOGOUT_API_PATH = "/api/auth/logout";
const CURRENT_USER_API_PATH = "/api/auth/me";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ??
  DEFAULT_API_BASE_URL;

/**
 * APIのURLを作成する。
 * @param path APIパス
 * @returns API URL
 */
const createApiUrl = (path: string): string => {
  return `${apiBaseUrl}${path}`;
};

/**
 * ユーザー登録APIへリクエストを送信する。
 * @param request ユーザー登録リクエスト
 * @returns 登録後のユーザー情報
 */
export const registerUserApi = async (
  request: RegisterUserRequest
): Promise<LoginUser> => {
  return Fetcher.postJson<LoginUser>(createApiUrl(USERS_API_PATH), request);
};

/**
 * ログインAPIへリクエストを送信する。
 * @param request ログインリクエスト
 * @returns ログイン結果
 */
export const loginApi = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  return Fetcher.postJson<LoginResponse>(createApiUrl(LOGIN_API_PATH), request);
};

/**
 * ログイン中ユーザー取得APIへリクエストを送信する。
 * @returns ログイン中ユーザー情報
 */
export const fetchCurrentUserApi = async (): Promise<LoginUser> => {
  return Fetcher.getJson<LoginUser>(createApiUrl(CURRENT_USER_API_PATH));
};

/**
 * ログアウトAPIへリクエストを送信する。
 */
export const logoutApi = async (): Promise<void> => {
  await Fetcher.postRequest(createApiUrl(LOGOUT_API_PATH), null);
};
