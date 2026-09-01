import type { ErrorResponse } from "@/types/interfaces";
import Const from "@/constants/const";
import { getAuthorizationHeaderValue } from "@/utils/authTokenStorage";

/**
 * Methodの定数
 */
const METHOD = {
  GET: "GET",
  POST: "POST",
} as const;

type HttpMethod = (typeof METHOD)[keyof typeof METHOD];

interface RequestData {
  requestUrl: string;
  options: RequestInit;
}

/**
 * HTTPエラー時に送出する例外。
 */
export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  errorResponse?: ErrorResponse;

  constructor(response: Response, errorResponse?: ErrorResponse) {
    super(
      `HTTP request failed: ${response.status} ${response.statusText} (${response.url})`
    );
    this.name = "HttpError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.url = response.url;
    this.errorResponse = errorResponse;
  }
}

/**
 * デフォルトのリクエストヘッダ情報
 */
const defaultHeader: Record<string, string> = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/** APIが応答しない場合にリクエストを中断するまでの時間 */
const REQUEST_TIMEOUT_MILLISECONDS = 10_000;

/**
 * GET送信の結果
 * @param uri リクエストURL
 * @returns fetch結果
 */
const getRequest = (uri: string): Promise<Response> => {
  // HTTPメソッドにGETを設定する
  const method = METHOD.GET;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, null, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * GET送信のJSONレスポンスを取得する。
 * @param uri リクエストURL
 * @returns JSONレスポンス
 */
const getJson = async <T>(uri: string): Promise<T> => {
  const response = await getRequest(uri);
  return response.json();
};

/**
 * POST送信の結果
 * @param uri リクエストURL
 * @param requestData 送信するリクエストボディのデータ
 * @returns fetch結果
 */
const postRequest = (uri: string, requestData: unknown): Promise<Response> => {
  // HTTPメソッドにPOSTを設定する
  const method = METHOD.POST;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, requestData, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * POST送信のJSONレスポンスを取得する。
 * @param uri リクエストURL
 * @param requestData 送信するリクエストボディのデータ
 * @returns JSONレスポンス
 */
const postJson = async <T>(uri: string, requestData: unknown): Promise<T> => {
  const response = await postRequest(uri, requestData);
  return response.json();
};

/**
 * fetch送信する
 * @param {Object} requestDatas リクエスト送信の設定情報
 * @returns fetch結果
 */
const fetcher = async (requestDatas: RequestData): Promise<Response> => {
  const response = await fetch(requestDatas.requestUrl, requestDatas.options);
  if (!response.ok) {
    throw new HttpError(response, await parseErrorResponse(response));
  }
  return response;
};

/**
 * HTTPエラー時のレスポンス本文を共通エラーレスポンスとして取得する。
 * @param response fetchレスポンス
 * @returns APIエラーレスポンス
 */
const parseErrorResponse = async (
  response: Response
): Promise<ErrorResponse | undefined> => {
  try {
    return (await response.clone().json()) as ErrorResponse;
  } catch {
    return undefined;
  }
};

/**
 * 認証ヘッダーを付与するAPIリクエストか判定する。
 *
 * @param uri リクエストURL
 * @returns 認証ヘッダーを付与する場合はtrue
 */
const isBackendApiRequest = (uri: string): boolean => {
  if (uri === "/api" || uri.startsWith("/api/")) {
    return true;
  }

  try {
    const backendUrl = new URL(Const.BACKEND_API.BASE_URL);
    const requestUrl = new URL(uri);
    const backendPath = backendUrl.pathname.replace(/\/$/, "");

    return (
      requestUrl.origin === backendUrl.origin &&
      (backendPath === "" ||
        requestUrl.pathname === backendPath ||
        requestUrl.pathname.startsWith(`${backendPath}/`))
    );
  } catch {
    return false;
  }
};

/**
 * リクエスト送信の設定情報を取得する
 *
 * @param uri リクエストURL
 * @param reqData 送信するリクエストボディのデータ
 * @param customHeader カスタムヘッダー
 * @param method HTTPメソッド
 * @returns リクエスト送信の設定情報
 */
const createRequestData = (
  uri: string,
  reqData: unknown,
  customHeader: HeadersInit | null,
  method: HttpMethod
): RequestData => {
  // HeadersInitは複数形式を受け取れるため、標準のHeadersに正規化して扱う。
  const headers = new Headers(customHeader ?? defaultHeader);
  const authorizationHeaderValue = isBackendApiRequest(uri)
    ? getAuthorizationHeaderValue()
    : null;
  if (authorizationHeaderValue) {
    headers.set("Authorization", authorizationHeaderValue);
  }

  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS);

  // HTTPメソッドがPOSTの場合のみリクエストボディを追加する。
  const body = method === METHOD.POST ? JSON.stringify(reqData) : undefined;
  const options: RequestInit = {
    method,
    headers,
    signal,
    ...(body !== undefined ? { body } : {}),
  };

  return {
    requestUrl: uri,
    options,
  };
};
export default {
  getRequest,
  getJson,
  postRequest,
  postJson,
};
