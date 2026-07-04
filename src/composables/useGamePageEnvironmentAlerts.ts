import Const from "@/constants/const";
import type { Alert } from "@/types/interfaces";
import Util from "@/utils/gameUtils";

interface GamePageEnvironmentAlertOptions {
  /** localStorageが利用可能かを判定する関数 */
  isLocalStorage?: () => boolean;
  /** サポート対象ブラウザかを判定する関数 */
  checkBrowser?: () => boolean;
}

/**
 * ゲーム画面の起動時に表示する環境チェックアラートを作成する。
 *
 * localStorageが利用できない場合や、サポート対象外ブラウザの場合に
 * エラーアラートを返す。
 *
 * @param options テスト時に差し替える判定関数
 * @returns 表示するアラート一覧
 */
export const createGamePageEnvironmentAlerts = (
  options: GamePageEnvironmentAlertOptions = {}
): Alert[] => {
  const isLocalStorage = options.isLocalStorage ?? Util.isLocalStorage;
  const checkBrowser = options.checkBrowser ?? Util.checkBrowser;
  const alerts: Alert[] = [];

  if (!isLocalStorage()) {
    alerts.push({
      message: "ローカルストレージは使用不可能です。",
      type: Const.ALERT_TYPE.ERROR,
    });
  }

  if (!checkBrowser()) {
    alerts.push({
      message: "Google Chromeをお使い下さい。",
      type: Const.ALERT_TYPE.ERROR,
    });
  }

  return alerts;
};
