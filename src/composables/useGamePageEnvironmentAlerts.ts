import Const from "@/constants/const";
import type { Alert } from "@/types/interfaces";
import Util from "@/utils/gameUtils";

interface GamePageEnvironmentAlertOptions {
  /** localStorageが利用可能かを判定する関数 */
  isLocalStorage?: () => boolean;
}

/**
 * ゲーム画面の起動時に表示する環境チェックアラートを作成する。
 *
 * localStorageが利用できない場合にエラーアラートを返す。
 *
 * @param options テスト時に差し替える判定関数
 * @returns 表示するアラート一覧
 */
export const createGamePageEnvironmentAlerts = (
  options: GamePageEnvironmentAlertOptions = {}
): Alert[] => {
  const isLocalStorage = options.isLocalStorage ?? Util.isLocalStorage;
  const alerts: Alert[] = [];

  if (!isLocalStorage()) {
    alerts.push({
      message: "ローカルストレージは使用不可能です。",
      type: Const.ALERT_TYPE.ERROR,
    });
  }

  return alerts;
};
