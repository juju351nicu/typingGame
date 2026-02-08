/**
 * Methodの定数
 */
const METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};
type HeaderType = {
  [K in string]: string;
};
/**
 * デフォルトのリクエストヘッダ情報
 */
const defaultHeader: HeaderType = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

/**
 * GET送信の結果
 * @param {string} uri リクエストURL
 * @param {Array} reqestData 送信するリクエストボディのデータ
 * @returns fetch結果
 */
const getRequest = (uri: string) => {
  // HttpMeshodに Getを設定する
  const method = METHOD.GET;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, null, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * POST送信の結果
 * @param {string} uri リクエストURL
 * @param {Array} reqestData 送信するリクエストボディのデータ
 * @returns fetch結果
 */
const postRequest = (uri: string, reqestData: any) => {
  // HttpMeshodに Postを設定する
  const method = METHOD.POST;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, reqestData, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * DELETE送信の結果
 * @param {string} uri リクエストURL
 * @returns fetch結果
 */
const deleteRequest = (uri: string) => {
  // HttpMeshodに Getを設定する
  const method = METHOD.DELETE;
  // リクエストデータ作成
  const requestDatas = createRequestData(uri, null, null, method);
  // fetch返却
  return fetcher(requestDatas);
};

/**
 * fetch送信する
 * @param {Object} requestDatas リクエスト送信の設定情報
 * @returns fetch結果
 */
const fetcher = async (requestDatas: { requestUrl: string; options: any }) => {
  const response = await fetch(requestDatas.requestUrl, requestDatas.options);
  return response;
};

/**
 * リクエスト送信の設定情報を取得する
 *
 * @param {string} uri リクエストURL
 * @param {?} reqData 送信するリクエストボディのデータ
 * @param {Headers} customHeader カスタムヘッダー
 * @param {METHOD} method Methodの定数
 * @returns リクエスト送信の設定情報
 */
const createRequestData = (
  uri: string,
  reqData: any,
  customHeader: any,
  method: string
) => {
  // リクエストヘッダ情報作成
  const headers = new Headers();
  if (customHeader !== null) {
    Object.keys(customHeader).forEach((key) => {
      headers.set(key, customHeader[key]);
    });
  } else {
    Object.keys(defaultHeader).forEach((key) => {
      headers.set(key, defaultHeader[key]);
    });
  }
  // optionsで HTTPMethodやHeadersを設定する
  let options = {};
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
  deleteRequest,
};
