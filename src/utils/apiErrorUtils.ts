import type { CustomFieldError } from "@/types/interfaces";
import { HttpError } from "@/utils/fetchClient";

/** 認証失敗時の画面表示メッセージ */
const DEFAULT_UNAUTHORIZED_MESSAGE =
  "メールアドレスまたはパスワードが正しくありません。";

/** バックエンドAPIへ到達できない場合の画面表示メッセージ */
const DEFAULT_NETWORK_ERROR_MESSAGE =
  "バックエンドAPIに接続できません。BE起動、npm run dev:api の利用、localhost:8081で開いているかを確認してください。";

/** その他APIエラー時の画面表示メッセージ */
const DEFAULT_API_ERROR_MESSAGE =
  "処理に失敗しました。時間をおいてもう一度お試しください。";

/** APIエラー表示の変換オプション */
interface ApiErrorMessageOptions {
  /** 401かつ共通エラーレスポンスがない場合のメッセージ */
  unauthorizedMessage?: string;
  /** CORSやBE停止など、fetch自体が失敗した場合のメッセージ */
  networkErrorMessage?: string;
  /** その他のエラー時のメッセージ */
  defaultMessage?: string;
}

/**
 * 認証切れ、または不正な認証情報によるAPIエラーか判定します。
 *
 * @param error 判定対象の例外
 * @returns 401のHTTPエラーの場合はtrue
 */
export const isUnauthorizedApiError = (error: unknown): boolean => {
  return error instanceof HttpError && error.status === 401;
};

/**
 * 例外を画面表示用のフィールドエラー一覧へ変換します。
 *
 * バックエンドが `fieldErrors` を返した場合はその内容を優先し、
 * CORSやBE停止などレスポンス本文を取得できない失敗では接続確認用の文言を返します。
 *
 * @param error 変換対象の例外
 * @param options エラーメッセージの上書き設定
 * @returns 画面表示用のフィールドエラー一覧
 */
export const toDisplayFieldErrors = (
  error: unknown,
  options: ApiErrorMessageOptions = {}
): CustomFieldError[] => {
  if (error instanceof HttpError) {
    if (error.errorResponse?.fieldErrors?.length) {
      return error.errorResponse.fieldErrors;
    }

    if (isUnauthorizedApiError(error)) {
      return [
        {
          errorCode: "UNAUTHORIZED",
          field: "",
          message: options.unauthorizedMessage ?? DEFAULT_UNAUTHORIZED_MESSAGE,
        },
      ];
    }
  }

  if (error instanceof TypeError) {
    return [
      {
        errorCode: "NETWORK_ERROR",
        field: "",
        message: options.networkErrorMessage ?? DEFAULT_NETWORK_ERROR_MESSAGE,
      },
    ];
  }

  return [
    {
      errorCode: "API_ERROR",
      field: "",
      message: options.defaultMessage ?? DEFAULT_API_ERROR_MESSAGE,
    },
  ];
};
