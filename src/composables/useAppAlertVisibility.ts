import { getCurrentInstance, onUnmounted, ref, watch, type Ref } from "vue";
import type { Alert } from "@/types/interfaces";

type TimeoutId = ReturnType<typeof setTimeout>;

type TimerHandler = () => void;

type AppAlertVisibilityOptions = {
  /** アラートを自動で非表示にするまでの時間 */
  autoHideDelayMs?: number;
  /** アラート同士の縦方向の間隔 */
  topOffsetPx?: number;
  /** テストでタイマーを差し替えるためのsetTimeout互換関数 */
  setTimer?: (handler: TimerHandler, timeout: number) => TimeoutId;
  /** テストでタイマーを差し替えるためのclearTimeout互換関数 */
  clearTimer?: (timerId: TimeoutId) => void;
};

const DEFAULT_AUTO_HIDE_DELAY_MS = 4000;
const DEFAULT_TOP_OFFSET_PX = 90;

/**
 * アラート配列から変更検知用の署名を作成する。
 *
 * @param alerts 画面に表示するアラート配列
 * @returns アラートの内容を表す署名配列
 */
const createAlertSignatures = (alerts: Alert[]): string[] => {
  return alerts.map(
    (alert) => `${alert.id ?? ""}:${alert.type ?? ""}:${alert.message}`
  );
};

/**
 * アラートの表示状態と自動非表示タイマーを管理する。
 *
 * @param alerts 画面に表示するアラート配列
 * @param options 表示時間や配置を調整するオプション
 */
export const useAppAlertVisibility = (
  alerts: Readonly<Ref<Alert[]>>,
  options: AppAlertVisibilityOptions = {}
) => {
  const autoHideDelayMs =
    options.autoHideDelayMs ?? DEFAULT_AUTO_HIDE_DELAY_MS;
  const topOffsetPx = options.topOffsetPx ?? DEFAULT_TOP_OFFSET_PX;
  const setTimer = options.setTimer ?? setTimeout;
  const clearTimer = options.clearTimer ?? clearTimeout;

  /** アラートごとの表示状態 */
  const visibleAlerts = ref<boolean[]>([]);
  /** 自動非表示タイマー */
  const hideTimerIds = ref<TimeoutId[]>([]);

  /** 登録済みの自動非表示タイマーを停止する。 */
  const clearHideTimers = (): void => {
    hideTimerIds.value.forEach((timerId) => clearTimer(timerId));
    hideTimerIds.value = [];
  };

  /**
   * 指定したアラートを非表示にする。
   *
   * @param index 非表示にするアラートのインデックス
   */
  const hideAlert = (index: number): void => {
    if (index < 0 || index >= visibleAlerts.value.length) {
      return;
    }
    visibleAlerts.value[index] = false;
  };

  /**
   * 指定したアラートを一定時間後に非表示にする。
   *
   * @param index 非表示タイマーを設定するアラートのインデックス
   */
  const scheduleHideAlert = (index: number): void => {
    const timerId = setTimer((): void => {
      hideAlert(index);
      hideTimerIds.value = hideTimerIds.value.filter((id) => id !== timerId);
    }, autoHideDelayMs);
    hideTimerIds.value.push(timerId);
  };

  /**
   * すべてのアラートを表示状態へ戻し、自動非表示タイマーを再設定する。
   *
   * @param alertCount 表示対象のアラート数
   */
  const resetVisibleAlerts = (alertCount: number): void => {
    clearHideTimers();
    visibleAlerts.value = Array.from({ length: alertCount }, () => true);
    visibleAlerts.value.forEach((_, index) => scheduleHideAlert(index));
  };

  watch(
    () => createAlertSignatures(alerts.value),
    (newSignatures, oldSignatures = []) => {
      const newLength = newSignatures.length;
      const oldLength = oldSignatures.length;
      const isSameLengthContentChanged =
        newLength === oldLength &&
        newSignatures.some(
          (signature, index) => signature !== oldSignatures[index]
        );

      if (newLength < oldLength || isSameLengthContentChanged) {
        resetVisibleAlerts(newLength);
        return;
      }

      visibleAlerts.value = visibleAlerts.value.slice(0, newLength);

      for (let index = oldLength; index < newLength; index++) {
        visibleAlerts.value[index] = true;
        scheduleHideAlert(index);
      }
    },
    { immediate: true }
  );

  if (getCurrentInstance() != null) {
    onUnmounted(() => {
      clearHideTimers();
    });
  }

  /**
   * アラートの縦位置を取得する。
   *
   * @param index インデックス
   * @returns style属性へ渡す位置情報
   */
  const getTopStyle = (index: number) => {
    const topPosition = index * topOffsetPx;
    return { top: `${topPosition}px` };
  };

  return {
    visibleAlerts,
    hideAlert,
    clearHideTimers,
    getTopStyle,
  };
};
