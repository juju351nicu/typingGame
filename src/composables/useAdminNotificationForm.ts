import { computed, reactive, ref } from "vue";
import Const from "@/constants/const";
import type { AdminNotificationRequest } from "@/types/interfaces";

/** お知らせの送信先 */
export type AdminNotificationTarget = "all" | "user";

/** お知らせ送信フォームの入力値 */
export interface AdminNotificationForm {
  title: string;
  body: string;
  linkPath: string;
  target: AdminNotificationTarget;
  /** 入力欄の値をそのまま保持するため文字列で扱う */
  userId: string;
}

/** 入力項目ごとのエラーメッセージ */
export type AdminNotificationFormErrors = Partial<
  Record<keyof AdminNotificationForm, string>
>;

/** 送信先の選択肢 */
export const ADMIN_NOTIFICATION_TARGET_OPTIONS: {
  label: string;
  value: AdminNotificationTarget;
}[] = [
  { label: "全ユーザー", value: "all" },
  { label: "ユーザーIDを指定", value: "user" },
];

/**
 * フォームの初期値を作成する。
 * @returns 空のフォーム入力値
 */
export const createEmptyAdminNotificationForm = (): AdminNotificationForm => {
  return {
    title: "",
    body: "",
    linkPath: "",
    target: "all",
    userId: "",
  };
};

/**
 * お知らせ送信フォームの入力値を検証する。
 *
 * BEと同じ制約（タイトル1〜100文字、本文1〜500文字、リンク先200文字以内で "/" から始まる）を
 * 送信前に確認し、項目ごとのメッセージを返す。
 *
 * @param form フォーム入力値
 * @returns エラーがある項目のメッセージ。エラーがない場合は空オブジェクト
 */
export const validateAdminNotificationForm = (
  form: AdminNotificationForm
): AdminNotificationFormErrors => {
  const errors: AdminNotificationFormErrors = {};
  const title = form.title.trim();
  const body = form.body.trim();
  const linkPath = form.linkPath.trim();
  const userId = form.userId.trim();

  if (!title) {
    errors.title = "タイトルを入力してください。";
  } else if (title.length > Const.NOTIFICATION.TITLE_MAX_LENGTH) {
    errors.title = `タイトルは${Const.NOTIFICATION.TITLE_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (!body) {
    errors.body = "本文を入力してください。";
  } else if (body.length > Const.NOTIFICATION.BODY_MAX_LENGTH) {
    errors.body = `本文は${Const.NOTIFICATION.BODY_MAX_LENGTH}文字以内で入力してください。`;
  }

  if (linkPath.length > Const.NOTIFICATION.LINK_PATH_MAX_LENGTH) {
    errors.linkPath = `リンク先は${Const.NOTIFICATION.LINK_PATH_MAX_LENGTH}文字以内で入力してください。`;
  } else if (
    linkPath &&
    // "//example.com" は外部サイトを指せるため、アプリ内パスとして扱わない。
    (!linkPath.startsWith("/") || linkPath.startsWith("//"))
  ) {
    errors.linkPath =
      "リンク先は「/」から始まるアプリ内のパスで入力してください。";
  }

  if (form.target === "user") {
    if (!userId) {
      errors.userId = "送信先のユーザーIDを入力してください。";
    } else if (!/^[1-9]\d*$/.test(userId)) {
      errors.userId = "ユーザーIDは1以上の整数で入力してください。";
    }
  }

  return errors;
};

/**
 * フォーム入力値を送信APIのリクエストへ変換する。
 *
 * @param form 検証済みのフォーム入力値
 * @returns お知らせ送信APIのリクエスト
 */
export const toAdminNotificationRequest = (
  form: AdminNotificationForm
): AdminNotificationRequest => {
  const linkPath = form.linkPath.trim();
  return {
    title: form.title.trim(),
    body: form.body.trim(),
    linkPath: linkPath || null,
    userId: form.target === "user" ? Number(form.userId.trim()) : null,
  };
};

/**
 * お知らせ送信フォームの入力値と検証結果を管理する。
 *
 * @returns フォームの状態と操作
 */
export const useAdminNotificationForm = () => {
  const form = reactive<AdminNotificationForm>(
    createEmptyAdminNotificationForm()
  );
  const errors = ref<AdminNotificationFormErrors>({});

  /** 送信先がユーザー指定か */
  const isUserTarget = computed((): boolean => form.target === "user");

  /**
   * 入力値を検証し、結果をerrorsへ反映する。
   * @returns エラーがない場合はtrue
   */
  const validate = (): boolean => {
    errors.value = validateAdminNotificationForm(form);
    return Object.keys(errors.value).length === 0;
  };

  /** フォームを初期状態へ戻す。 */
  const reset = (): void => {
    Object.assign(form, createEmptyAdminNotificationForm());
    errors.value = {};
  };

  /** 送信APIのリクエストを作成する。 */
  const toRequest = (): AdminNotificationRequest => {
    return toAdminNotificationRequest(form);
  };

  return {
    form,
    errors,
    isUserTarget,
    validate,
    reset,
    toRequest,
  };
};
