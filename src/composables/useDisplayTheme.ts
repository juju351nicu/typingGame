import { computed, watch } from "vue";
import Const from "@/constants/const";

interface DisplayThemeStore {
  getDisplayMode: boolean;
}

interface DisplayThemeController {
  global: {
    name: {
      value: string;
    };
  };
}

/**
 * ダークモードの有無からVuetifyのテーマ名を取得する。
 *
 * @param isDarkMode ダークモードの場合 true
 * @returns Vuetifyに設定するテーマ名
 */
export const getDisplayThemeName = (isDarkMode: boolean): string => {
  return isDarkMode ? Const.DISPLAY_THEME.DARK : Const.DISPLAY_THEME.LIGHT;
};

/**
 * Piniaの表示設定とVuetifyテーマを同期する。
 *
 * App.vue からテーマ同期処理を切り出し、画面コンポーネント側は
 * class切り替えに使う状態だけを扱う。
 *
 * @param configStore 表示テーマ設定を持つstore
 * @param theme Vuetifyのthemeインスタンス
 * @returns ダークモード状態
 */
export const useDisplayTheme = (
  configStore: DisplayThemeStore,
  theme: DisplayThemeController
) => {
  const isDarkMode = computed((): boolean => {
    return configStore.getDisplayMode;
  });

  watch(
    isDarkMode,
    (newValue) => {
      theme.global.name.value = getDisplayThemeName(newValue);
    },
    {
      immediate: true,
    }
  );

  return {
    isDarkMode,
  };
};
