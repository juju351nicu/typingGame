import { afterEach, describe, expect, it, vi } from "vitest";

describe("constants", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("APIベースURLが空文字の場合はローカルAPIの既定値を使う", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "");
    const { default: Const } = await import("@/constants/const");

    expect(Const.BACKEND_API.BASE_URL).toBe("http://localhost:8091");
  });
});
