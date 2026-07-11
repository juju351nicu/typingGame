import { describe, expect, it } from "vitest";
import { toDisplayFieldErrors } from "@/utils/apiErrorUtils";
import { HttpError } from "@/utils/fetchClient";

const createHttpError = (
  status: number,
  statusText: string,
  body?: unknown
): HttpError => {
  const response = new Response(body ? JSON.stringify(body) : null, {
    status,
    statusText,
  });
  return new HttpError(response, body as never);
};

describe("apiErrorUtils", () => {
  it("APIのfieldErrorsがある場合はその内容を優先する", () => {
    const fieldErrors = [
      {
        errorCode: "Unauthorized",
        field: "password",
        message: "メールアドレスまたはパスワードが正しくありません。",
      },
    ];

    const result = toDisplayFieldErrors(
      createHttpError(401, "Unauthorized", { fieldErrors })
    );

    expect(result).toEqual(fieldErrors);
  });

  it("401でfieldErrorsがない場合は認証失敗メッセージを返す", () => {
    const result = toDisplayFieldErrors(
      createHttpError(401, "Unauthorized")
    );

    expect(result).toEqual([
      expect.objectContaining({
        errorCode: "UNAUTHORIZED",
        message: "メールアドレスまたはパスワードが正しくありません。",
      }),
    ]);
  });

  it("fetch自体が失敗した場合は接続確認用メッセージを返す", () => {
    const result = toDisplayFieldErrors(new TypeError("Failed to fetch"));

    expect(result).toEqual([
      expect.objectContaining({
        errorCode: "NETWORK_ERROR",
        message:
          "バックエンドAPIに接続できません。BE起動、npm run dev:api の利用、localhost:8081で開いているかを確認してください。",
      }),
    ]);
  });
});
