import { computed, watch } from "vue";
import Const from "@/constants/const";

interface DisplayThemeStore {
  getDisplayMode: boolean;
}

/** テーマ用classを付け替える対象要素（テストでは差し替えられるよう最小限の型にする） */
export interface DisplayThemeRoot {
  classList: Pick<DOMTokenList, "toggle">;
  style: Pick<CSSStyleDeclaration, "colorScheme">;
}

/**
 * ダークモードの有無からテーマ名を取得する。
 *
 * @param isDarkMode ダークモードの場合 true
 * @returns <html> へ付けるテーマ名（"light" または "dark"）
 */
export const getDisplayThemeName = (isDarkMode: boolean): string => {
  return isDarkMode ? Const.DISPLAY_THEME.DARK : Const.DISPLAY_THEME.LIGHT;
};

/**
 * テーマ名をルート要素へ反映する。
 *
 * Nuxt UIとTailwind CSSは <html class="dark"> でダークモードを判定するため、
 * classとブラウザ標準UI用の color-scheme をまとめて切り替える。
 *
 * @param root テーマを反映する要素
 * @param isDarkMode ダークモードの場合 true
 */
export const applyDisplayTheme = (
  root: DisplayThemeRoot,
  isDarkMode: boolean
): void => {
  root.classList.toggle(Const.DISPLAY_THEME.DARK, isDarkMode);
  root.style.colorScheme = getDisplayThemeName(isDarkMode);
};

/**
 * Piniaの表示設定と画面のテーマを同期する。
 *
 * App.vue からテーマ同期処理を切り出し、画面コンポーネント側は
 * class切り替えに使う状態だけを扱う。
 *
 * @param configStore 表示テーマ設定を持つstore
 * @param root テーマを反映する要素。既定は <html>
 * @returns ダークモード状態
 */
export const useDisplayTheme = (
  configStore: DisplayThemeStore,
  root: DisplayThemeRoot = document.documentElement
) => {
  const isDarkMode = computed((): boolean => {
    return configStore.getDisplayMode;
  });

  watch(
    isDarkMode,
    (newValue) => {
      applyDisplayTheme(root, newValue);
    },
    {
      immediate: true,
    }
  );

  return {
    isDarkMode,
  };
};
