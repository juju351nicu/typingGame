/**
 * Methodの定数
 */
const METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

type HttpMethod = (typeof METHOD)[keyof typeof METHOD];

interface RequestData {
  requestUrl: string;
  options: RequestInit;
}

/**
 * デフォルトのリクエストヘッダ情報
 */
const defaultHeader: Record<string, string> = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/**
 * GET送信の結果
 * @param uri リクエストURL
 * @returns fetch結果
 */
const getRequest = (uri: string): Promise<Response> => {
  // HttpMeshodに Getを設定する
  const method = METHOD.GET;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, null, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * POST送信の結果
 * @param uri リクエストURL
 * @param reqestData 送信するリクエストボディのデータ
 * @returns fetch結果
 */
const postRequest = (uri: string, reqestData: unknown): Promise<Response> => {
  // HttpMeshodに Postを設定する
  const method = METHOD.POST;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, reqestData, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * fetch送信する
 * @param {Object} requestDatas リクエスト送信の設定情報
 * @returns fetch結果
 */
const fetcher = async (requestDatas: RequestData): Promise<Response> => {
  const response = await fetch(requestDatas.requestUrl, requestDatas.options);
  return response;
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

  // optionsで HTTPMethodやHeadersを設定する
  let options: RequestInit = {};
  // HTTPメソッドがPOST・PUTの場合のみリクエストボディを追加する
  if (method === METHOD.POST || method === METHOD.PUT) {
    const body = JSON.stringify(reqData);
    options = { method, headers, body };
  } else {
    options = { method, headers };
  }

  return {
    requestUrl: uri,
    options,
  };
};
export default {
  getRequest,
  postRequest,
};
