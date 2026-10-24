import {
  applyDisplayTheme,
  getDisplayThemeName,
  useDisplayTheme,
  type DisplayThemeRoot,
} from "@/composables/useDisplayTheme";
import Const from "@/constants/const";
import { nextTick, reactive } from "vue";
import { describe, expect, it, vi } from "vitest";

/**
 * テーマ反映先の要素を作成する。
 *
 * @returns classList.toggle の呼び出しを記録する要素
 */
const createRoot = () => {
  const toggle = vi.fn<(token: string, force?: boolean) => boolean>();
  const root: DisplayThemeRoot = {
    classList: { toggle },
    style: { colorScheme: "" },
  };
  return Object.assign(root, { classList: { toggle } });
};

describe("useDisplayTheme", () => {
  it("ライトモードのテーマ名を返す", () => {
    expect(getDisplayThemeName(false)).toBe(Const.DISPLAY_THEME.LIGHT);
  });

  it("ダークモードのテーマ名を返す", () => {
    expect(getDisplayThemeName(true)).toBe(Const.DISPLAY_THEME.DARK);
  });

  it("ダークモードではdark classとcolor-schemeを設定する", () => {
    const root = createRoot();

    applyDisplayTheme(root, true);

    expect(root.classList.toggle).toHaveBeenCalledWith("dark", true);
    expect(root.style.colorScheme).toBe("dark");
  });

  it("ストアの表示設定の変更をルート要素へ反映する", async () => {
    const root = createRoot();
    const configStore = reactive({ getDisplayMode: false });

    const { isDarkMode } = useDisplayTheme(configStore, root);
    expect(isDarkMode.value).toBe(false);
    expect(root.classList.toggle).toHaveBeenLastCalledWith("dark", false);

    configStore.getDisplayMode = true;
    await nextTick();

    expect(isDarkMode.value).toBe(true);
    expect(root.classList.toggle).toHaveBeenLastCalledWith("dark", true);
    expect(root.style.colorScheme).toBe("dark");
  });
});
