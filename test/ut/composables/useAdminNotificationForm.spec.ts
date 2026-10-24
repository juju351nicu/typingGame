import {
  createEmptyAdminNotificationForm,
  toAdminNotificationRequest,
  validateAdminNotificationForm,
  type AdminNotificationForm,
} from "@/composables/useAdminNotificationForm";
import { describe, expect, it } from "vitest";

/**
 * 入力済みのフォーム値を作成する。
 *
 * @param overrides 上書きする入力値
 * @returns フォーム入力値
 */
const createForm = (
  overrides: Partial<AdminNotificationForm> = {}
): AdminNotificationForm => ({
  ...createEmptyAdminNotificationForm(),
  title: "メンテナンスのお知らせ",
  body: "10/30にメンテナンスを行います。",
  ...overrides,
});

describe("useAdminNotificationForm", () => {
  it("必須項目が入力されていればエラーにしない", () => {
    expect(validateAdminNotificationForm(createForm())).toEqual({});
  });

  it("タイトルと本文が空白だけの場合はエラーにする", () => {
    const errors = validateAdminNotificationForm(
      createForm({ title: "  ", body: "" })
    );

    expect(errors.title).toBe("タイトルを入力してください。");
    expect(errors.body).toBe("本文を入力してください。");
  });

  it("文字数の上限を超えた場合はエラーにする", () => {
    const errors = validateAdminNotificationForm(
      createForm({
        title: "a".repeat(101),
        body: "b".repeat(501),
        linkPath: `/${"c".repeat(200)}`,
      })
    );

    expect(errors.title).toContain("100文字以内");
    expect(errors.body).toContain("500文字以内");
    expect(errors.linkPath).toContain("200文字以内");
  });

  it.each([
    ["https://example.com", true],
    ["//example.com", true],
    ["scoresBoard", true],
    ["/scoresBoard", false],
    ["", false],
  ])("リンク先「%s」のエラー有無は%s", (linkPath, hasError) => {
    const errors = validateAdminNotificationForm(createForm({ linkPath }));

    expect(Boolean(errors.linkPath)).toBe(hasError);
  });

  it.each([
    ["", "送信先のユーザーIDを入力してください。"],
    ["0", "ユーザーIDは1以上の整数で入力してください。"],
    ["1.5", "ユーザーIDは1以上の整数で入力してください。"],
    ["abc", "ユーザーIDは1以上の整数で入力してください。"],
  ])("ユーザー指定でID「%s」はエラーにする", (userId, message) => {
    const errors = validateAdminNotificationForm(
      createForm({ target: "user", userId })
    );

    expect(errors.userId).toBe(message);
  });

  it("全ユーザー宛てではユーザーIDを検証せず、nullで送信する", () => {
    const form = createForm({ target: "all", userId: "abc" });

    expect(validateAdminNotificationForm(form).userId).toBeUndefined();
    expect(toAdminNotificationRequest(form)).toEqual({
      title: "メンテナンスのお知らせ",
      body: "10/30にメンテナンスを行います。",
      linkPath: null,
      userId: null,
    });
  });

  it("ユーザー指定では入力値を数値へ変換し、前後の空白を除いて送信する", () => {
    const request = toAdminNotificationRequest(
      createForm({
        title: " 新機能 ",
        linkPath: " /scoresBoard ",
        target: "user",
        userId: " 12 ",
      })
    );

    expect(request).toMatchObject({
      title: "新機能",
      linkPath: "/scoresBoard",
      userId: 12,
    });
  });
});
