import {
  getRandomWordLeft,
  getResponsiveBalloonWidth,
} from "@/composables/useTypingBoardLayout";
import { describe, expect, it } from "vitest";

describe("useTypingBoardLayout", () => {
  it("スマホ幅では小さい風船幅を返す", () => {
    expect(getResponsiveBalloonWidth(480, 200)).toBe(120);
  });

  it("タブレット幅では中間の風船幅を返す", () => {
    expect(getResponsiveBalloonWidth(760, 200)).toBe(140);
  });

  it("PC幅または幅未取得時はデフォルトの風船幅を返す", () => {
    expect(getResponsiveBalloonWidth(900, 200)).toBe(200);
    expect(getResponsiveBalloonWidth(undefined, 200)).toBe(200);
  });

  it("表示エリア内に収まる横位置を返す", () => {
    expect(getRandomWordLeft(500, 100, () => 0)).toBe(0);
    expect(getRandomWordLeft(500, 100, () => 0.5)).toBe(200);
  });

  it("表示エリア幅が未取得または風船幅以下の場合は0を返す", () => {
    expect(getRandomWordLeft(undefined, 100)).toBe(0);
    expect(getRandomWordLeft(80, 100, () => 0.5)).toBe(0);
  });
});
