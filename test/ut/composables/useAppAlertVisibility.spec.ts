import { nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAppAlertVisibility } from "@/composables/useAppAlertVisibility";
import type { Alert } from "@/types/interfaces";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useAppAlertVisibility", () => {
  it("追加されたアラートを表示し、指定時間後に非表示にする", async () => {
    const alerts = ref<Alert[]>([]);
    const { visibleAlerts } = useAppAlertVisibility(alerts, {
      autoHideDelayMs: 1000,
    });

    alerts.value.push({ message: "保存しました", type: "success" });
    await nextTick();

    expect(visibleAlerts.value).toEqual([true]);

    vi.advanceTimersByTime(999);
    expect(visibleAlerts.value).toEqual([true]);

    vi.advanceTimersByTime(1);
    expect(visibleAlerts.value).toEqual([false]);
  });

  it("手動でアラートを非表示にする", async () => {
    const alerts = ref<Alert[]>([
      { message: "保存しました", type: "success" },
    ]);
    const { hideAlert, visibleAlerts } = useAppAlertVisibility(alerts);

    await nextTick();
    hideAlert(0);

    expect(visibleAlerts.value).toEqual([false]);
  });

  it("範囲外のインデックスを指定しても表示状態を変更しない", async () => {
    const alerts = ref<Alert[]>([
      { message: "保存しました", type: "success" },
    ]);
    const { hideAlert, visibleAlerts } = useAppAlertVisibility(alerts);

    await nextTick();
    hideAlert(-1);
    hideAlert(1);

    expect(visibleAlerts.value).toEqual([true]);
  });

  it("同じ件数でアラート内容が差し替わった場合は表示状態とタイマーをリセットする", async () => {
    const alerts = ref<Alert[]>([{ message: "保存しました", type: "success" }]);
    const { visibleAlerts } = useAppAlertVisibility(alerts, {
      autoHideDelayMs: 1000,
    });

    await nextTick();
    vi.advanceTimersByTime(1000);
    expect(visibleAlerts.value).toEqual([false]);

    alerts.value = [{ message: "削除しました", type: "info" }];
    await nextTick();

    expect(visibleAlerts.value).toEqual([true]);
  });

  it("アラート数が減った場合は古いタイマーを停止する", async () => {
    const alerts = ref<Alert[]>([
      { message: "保存しました", type: "success" },
      { message: "削除しました", type: "info" },
    ]);
    const { visibleAlerts } = useAppAlertVisibility(alerts, {
      autoHideDelayMs: 1000,
    });

    await nextTick();
    alerts.value = [];
    await nextTick();
    vi.advanceTimersByTime(1000);

    expect(visibleAlerts.value).toEqual([]);
  });

  it("インデックスに応じた表示位置を返す", () => {
    const alerts = ref<Alert[]>([]);
    const { getTopStyle } = useAppAlertVisibility(alerts, {
      topOffsetPx: 80,
    });

    expect(getTopStyle(2)).toEqual({ top: "160px" });
  });
});
