import Util from "@/utils/util";
import { describe, expect, it } from "vitest";

describe("isEmpty", () => {
  it("空文字チェック", () => {
    const result = Util.isEmpty("");
    expect(result).toBe(true);
  });
});

describe("calculateWpm", () => {
  it("正しく入力した文字数と時間からWPMを計算する", () => {
    const result = Util.calculateWpm(25, 60_000);
    expect(result).toBe(5);
  });

  it("入力文字数または時間が0以下の場合は0を返す", () => {
    expect(Util.calculateWpm(0, 60_000)).toBe(0);
    expect(Util.calculateWpm(25, 0)).toBe(0);
  });
});

describe("calculateAccuracy", () => {
  it("入力文字数とミス数から正確率を計算する", () => {
    const result = Util.calculateAccuracy(10, 2);
    expect(result).toBe(80);
  });

  it("入力文字数が0の場合は100を返す", () => {
    expect(Util.calculateAccuracy(0, 0)).toBe(100);
  });

  it("ミス数が入力文字数を超えた場合は0を返す", () => {
    expect(Util.calculateAccuracy(5, 10)).toBe(0);
  });
});

describe("getResultRank", () => {
  it("スコアからランクを判定する", () => {
    expect(Util.getResultRank(20)).toBe("S");
    expect(Util.getResultRank(12)).toBe("A");
    expect(Util.getResultRank(6)).toBe("B");
    expect(Util.getResultRank(5)).toBe("C");
  });
});

describe("getResultRankColor", () => {
  it("ランクに対応した色を返す", () => {
    expect(Util.getResultRankColor("S")).toBe("#ffd43b");
    expect(Util.getResultRankColor("A")).toBe("#4dabf7");
    expect(Util.getResultRankColor("B")).toBe("#51cf66");
    expect(Util.getResultRankColor("C")).toBe("#868e96");
  });
});
