import { describe, expect, it, vi } from "vitest";
import { createGamePageEnvironmentAlerts } from "@/composables/useGamePageEnvironmentAlerts";
import Const from "@/constants/const";

describe("createGamePageEnvironmentAlerts", () => {
  it("localStorageが利用可能な場合はアラートを返さない", () => {
    const alerts = createGamePageEnvironmentAlerts({
      isLocalStorage: vi.fn(() => true),
    });

    expect(alerts).toEqual([]);
  });

  it("localStorageが利用できない場合はエラーアラートを返す", () => {
    const alerts = createGamePageEnvironmentAlerts({
      isLocalStorage: vi.fn(() => false),
    });

    expect(alerts).toEqual([
      {
        message: "ローカルストレージは使用不可能です。",
        type: Const.ALERT_TYPE.ERROR,
      },
    ]);
  });
});
