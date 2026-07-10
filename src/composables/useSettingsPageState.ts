import Const from "@/constants/const";
import { resetGameScores } from "@/composables/useScoreReset";
import type {
  Alert,
  GameMode,
  GameRule,
  TimeLimitSeconds,
} from "@/types/interfaces";
import { computed, ref } from "vue";

/** 難易度選択に表示する項目 */
interface DifficultyOption {
  /** 画面に表示する難易度名 */
  title: string;
  /** 設定ストアへ保存する難易度値 */
  value: GameMode;
}

/** ゲームルール選択に表示する項目 */
interface GameRuleOption {
  /** 画面に表示するゲームルール名 */
  title: string;
  /** 設定ストアへ保存するゲームルール値 */
  value: GameRule;
}

/** タイムアタック制限時間の選択に表示する項目 */
interface TimeLimitOption {
  /** 画面に表示する制限時間ラベル */
  title: string;
  /** 設定ストアへ保存する制限時間（秒） */
  value: TimeLimitSeconds;
}

/**
 * 設定画面が参照・更新する設定ストアの最小インターフェース。
 *
 * Pinia本体に依存しすぎない形にして、composable単体のテストで
 * 必要なgetterとactionだけを差し替えられるようにする。
 */
interface SettingsConfigStore {
  /** 現在保存されている難易度 */
  getGameMode: GameMode;
  /** 現在保存されているゲームルール */
  getGameRule: GameRule;
  /** 現在保存されているタイムアタック制限時間 */
  getTimeLimitSeconds: TimeLimitSeconds;
  /** 現在保存されている仮想キーボード表示有無 */
  getIsVirtualKeyBoard: boolean;
  /** 現在保存されているダークモード有無 */
  getDisplayMode: boolean;
  /** 難易度を保存する */
  saveGameMode: (mode: GameMode) => void;
  /** ゲームルールを保存する */
  saveGameRule: (gameRule: GameRule) => void;
  /** タイムアタック制限時間を保存する */
  saveTimeLimitSeconds: (seconds: TimeLimitSeconds) => void;
  /** 仮想キーボード表示有無を保存する */
  saveIsVirtualKeyboard: (isVisible: boolean) => void;
  /** ダークモード有無を保存する */
  saveDisplayMode: (isDark: boolean) => void;
}

/** 設定画面からスコア初期化に使うスコアストアの最小インターフェース。 */
interface SettingsGameScoresStore {
  /** 保存済みスコア一覧を削除する */
  deleteGameScoreList: () => void;
}

/**
 * 設定画面の選択状態と保存処理を管理する。
 *
 * SettingsPage.vueから設定保存とスコア初期化の状態管理を切り出し、
 * store呼び出しやnullガードをテストしやすくする。
 *
 * @param configStore 設定ストア
 * @param gameScoresStore スコアストア
 */
export const useSettingsPageState = (
  configStore: SettingsConfigStore,
  gameScoresStore: SettingsGameScoresStore
) => {
  /** 画面で選択中の難易度 */
  const selectedOption = ref(configStore.getGameMode);

  /** 画面で選択中のゲームルール */
  const selectedGameRule = ref<GameRule>(configStore.getGameRule);

  /** 画面で選択中のタイムアタック制限時間 */
  const selectedTimeLimitSeconds = ref<TimeLimitSeconds>(
    configStore.getTimeLimitSeconds
  );

  /** 画面で選択中の仮想キーボード表示有無 */
  const isVirtualKeyboardVisible = ref(configStore.getIsVirtualKeyBoard);

  /** 画面で選択中のダークモード有無 */
  const isDarkMode = ref(configStore.getDisplayMode);

  /** ゲーム難易度の選択項目 */
  const options = ref<DifficultyOption[]>(Const.DIFFICULTY_LEVEL);

  /** ゲームルールの選択項目 */
  const gameRuleOptions = ref<GameRuleOption[]>(Const.GAME_RULE_OPTIONS);

  /** タイムアタック制限時間の選択項目 */
  const timeLimitOptions = ref<TimeLimitOption[]>(Const.TIME_ATTACK_LIMITS);

  /** タイムアタック選択時だけ制限時間の設定を表示する */
  const isTimeAttackMode = computed((): boolean => {
    return selectedGameRule.value === Const.GAME_RULE.TIME_ATTACK;
  });

  /** スコア初期化結果などを表示するアラート */
  const alerts = ref<Alert[]>([]);

  /** スコア初期化確認ダイアログの表示状態 */
  const isResetDialogOpen = ref(false);

  /**
   * ゲームの難易度を保存する。
   *
   * @param mode 難易度
   */
  const setGameMode = (mode: GameMode): void => {
    configStore.saveGameMode(mode);
  };

  /**
   * ゲームルールを保存する。
   *
   * @param gameRule ゲームルール
   */
  const setGameRule = (gameRule: GameRule): void => {
    configStore.saveGameRule(gameRule);
  };

  /**
   * タイムアタックの制限時間を保存する。
   *
   * @param seconds 制限時間（秒）
   */
  const setTimeLimitSeconds = (seconds: TimeLimitSeconds): void => {
    configStore.saveTimeLimitSeconds(seconds);
  };

  /**
   * 仮想キーボードの表示有無を保存する。
   *
   * Vuetifyのswitchはnullを渡す可能性があるため、booleanの時だけ保存する。
   *
   * @param isVisible 表示する場合 true
   */
  const setVirtualKeyboardVisible = (isVisible: boolean | null): void => {
    if (isVisible === null) {
      return;
    }
    configStore.saveIsVirtualKeyboard(isVisible);
  };

  /**
   * 表示テーマを保存する。
   *
   * Vuetifyのswitchはnullを渡す可能性があるため、booleanの時だけ保存する。
   *
   * @param isDark ダークモードにする場合 true
   */
  const setDisplayMode = (isDark: boolean | null): void => {
    if (isDark === null) {
      return;
    }
    configStore.saveDisplayMode(isDark);
  };

  /** スコア初期化確認ダイアログを開く。 */
  const openResetDialog = (): void => {
    isResetDialogOpen.value = true;
  };

  /** スコア初期化確認ダイアログを閉じる。 */
  const closeResetDialog = (): void => {
    isResetDialogOpen.value = false;
  };

  /** 保存済みスコアを初期化して確認ダイアログを閉じる。 */
  const resetModalData = (): void => {
    resetGameScores(gameScoresStore, alerts.value);
    closeResetDialog();
  };

  return {
    alerts,
    closeResetDialog,
    gameRuleOptions,
    isDarkMode,
    isResetDialogOpen,
    isTimeAttackMode,
    isVirtualKeyboardVisible,
    openResetDialog,
    options,
    resetModalData,
    selectedGameRule,
    selectedOption,
    selectedTimeLimitSeconds,
    setDisplayMode,
    setGameMode,
    setGameRule,
    setTimeLimitSeconds,
    setVirtualKeyboardVisible,
    timeLimitOptions,
  };
};
