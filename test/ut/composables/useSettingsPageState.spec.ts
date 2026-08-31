import { useSettingsPageState } from "@/composables/useSettingsPageState";
import Const from "@/constants/const";
import type { GameMode, GameRule, TimeLimitSeconds } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createConfigStore = () => ({
  getGameMode: 1 as GameMode,
  getGameRule: Const.GAME_RULE.NORMAL as GameRule,
  getTimeLimitSeconds: 60 as TimeLimitSeconds,
  getIsVirtualKeyBoard: true,
  getDisplayMode: false,
  saveGameMode: vi.fn(),
  saveGameRule: vi.fn(),
  saveTimeLimitSeconds: vi.fn(),
  saveIsVirtualKeyboard: vi.fn(),
  saveDisplayMode: vi.fn(),
});

const createGameScoresStore = () => ({
  deleteGameScoreList: vi.fn(),
});

describe("useSettingsPageState", () => {
  it("設定ストアの現在値を初期選択値にする", () => {
    const configStore = createConfigStore();
    const gameScoresStore = createGameScoresStore();

    const settingsState = useSettingsPageState(configStore, gameScoresStore);

    expect(settingsState.selectedOption.value).toBe(1);
    expect(settingsState.selectedGameRule.value).toBe(Const.GAME_RULE.NORMAL);
    expect(settingsState.selectedTimeLimitSeconds.value).toBe(60);
    expect(settingsState.isVirtualKeyboardVisible.value).toBe(true);
    expect(settingsState.isDarkMode.value).toBe(false);
  });

  it("タイムアタック選択時だけ制限時間設定を表示する", () => {
    const configStore = createConfigStore();
    const gameScoresStore = createGameScoresStore();
    const settingsState = useSettingsPageState(configStore, gameScoresStore);

    expect(settingsState.isTimeAttackMode.value).toBe(false);

    settingsState.selectedGameRule.value = Const.GAME_RULE.TIME_ATTACK;

    expect(settingsState.isTimeAttackMode.value).toBe(true);
  });

  it("選択した設定値をストアへ保存する", () => {
    const configStore = createConfigStore();
    const gameScoresStore = createGameScoresStore();
    const settingsState = useSettingsPageState(configStore, gameScoresStore);

    settingsState.setGameMode(2);
    settingsState.setGameRule(Const.GAME_RULE.TIME_ATTACK);
    settingsState.setTimeLimitSeconds(90);
    settingsState.setVirtualKeyboardVisible(false);
    settingsState.setDisplayMode(true);

    expect(configStore.saveGameMode).toHaveBeenCalledWith(2);
    expect(configStore.saveGameRule).toHaveBeenCalledWith(
      Const.GAME_RULE.TIME_ATTACK
    );
    expect(configStore.saveTimeLimitSeconds).toHaveBeenCalledWith(90);
    expect(configStore.saveIsVirtualKeyboard).toHaveBeenCalledWith(false);
    expect(configStore.saveDisplayMode).toHaveBeenCalledWith(true);
  });

  it("switchがnullを渡した場合は保存しない", () => {
    const configStore = createConfigStore();
    const gameScoresStore = createGameScoresStore();
    const settingsState = useSettingsPageState(configStore, gameScoresStore);

    settingsState.setVirtualKeyboardVisible(null);
    settingsState.setDisplayMode(null);

    expect(configStore.saveIsVirtualKeyboard).not.toHaveBeenCalled();
    expect(configStore.saveDisplayMode).not.toHaveBeenCalled();
  });

  it("スコア初期化後にアラートを追加して確認ダイアログを閉じる", () => {
    const configStore = createConfigStore();
    const gameScoresStore = createGameScoresStore();
    const settingsState = useSettingsPageState(configStore, gameScoresStore);

    settingsState.openResetDialog();
    settingsState.resetModalData();

    expect(gameScoresStore.deleteGameScoreList).toHaveBeenCalledTimes(1);
    expect(settingsState.isResetDialogOpen.value).toBe(false);
    expect(settingsState.alerts.value).toEqual([
      {
        message: "スコアを初期化しました。",
        type: "success",
      },
    ]);
  });
});
