import Util from "@/utils/util";
import { describe, expect, it } from 'vitest';

/**
 * 
 */
describe("isEmpty", () => {
  it("空文字チェック", () => {
    const result = Util.isEmpty("");
    expect(result).toBe(true);
  })
})