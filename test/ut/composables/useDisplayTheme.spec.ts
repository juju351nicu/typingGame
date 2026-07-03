import { getDisplayThemeName } from "@/composables/useDisplayTheme";
import Const from "@/constants/const";
import { describe, expect, it } from "vitest";

describe("useDisplayTheme", () => {
  it("ライトモードのテーマ名を返す", () => {
    expect(getDisplayThemeName(false)).toBe(Const.DISPLAY_THEME.LIGHT);
  });

  it("ダークモードのテーマ名を返す", () => {
    expect(getDisplayThemeName(true)).toBe(Const.DISPLAY_THEME.DARK);
  });
});
