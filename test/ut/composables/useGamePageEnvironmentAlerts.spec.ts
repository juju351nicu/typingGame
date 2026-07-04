import { describe, expect, it, vi } from "vitest";
import { createGamePageEnvironmentAlerts } from "@/composables/useGamePageEnvironmentAlerts";
import Const from "@/constants/const";

describe("createGamePageEnvironmentAlerts", () => {
  it("localStorageとブラウザが利用可能な場合はアラートを返さない", () => {
    const alerts = createGamePageEnvironmentAlerts({
      isLocalStorage: vi.fn(() => true),
      checkBrowser: vi.fn(() => true),
    });

    expect(alerts).toEqual([]);
  });

  it("localStorageが利用できない場合はエラーアラートを返す", () => {
    const alerts = createGamePageEnvironmentAlerts({
      isLocalStorage: vi.fn(() => false),
      checkBrowser: vi.fn(() => true),
    });

    expect(alerts).toEqual([
      {
        message: "ローカルストレージは使用不可能です。",
        type: Const.ALERT_TYPE.ERROR,
      },
    ]);
  });

  it("サポート対象外ブラウザの場合はエラーアラートを返す", () => {
    const alerts = createGamePageEnvironmentAlerts({
      isLocalStorage: vi.fn(() => true),
      checkBrowser: vi.fn(() => false),
    });

    expect(alerts).toEqual([
      {
        message: "Google Chromeをお使い下さい。",
        type: Const.ALERT_TYPE.ERROR,
      },
    ]);
  });

  it("localStorageとブラウザの両方に問題がある場合は両方のアラートを返す", () => {
    const alerts = createGamePageEnvironmentAlerts({
      isLocalStorage: vi.fn(() => false),
      checkBrowser: vi.fn(() => false),
    });

    expect(alerts).toEqual([
      {
        message: "ローカルストレージは使用不可能です。",
        type: Const.ALERT_TYPE.ERROR,
      },
      {
        message: "Google Chromeをお使い下さい。",
        type: Const.ALERT_TYPE.ERROR,
      },
    ]);
  });
});
