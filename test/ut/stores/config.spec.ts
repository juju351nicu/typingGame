import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Const from "@/constants/const";

const createMemoryStorage = () => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: vi.fn(() => store.clear()),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
  } satisfies Storage;
};

describe("config store", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("localStorage", createMemoryStorage());
    setActivePinia(createPinia());
  });

  it("デフォルトでは通常モードと60秒を設定する", async () => {
    const { useConfigStore } = await import("@/stores/config");
    const configStore = useConfigStore();

    expect(configStore.getGameRule).toBe(Const.GAME_RULE.NORMAL);
    expect(configStore.getTimeLimitSeconds).toBe(60);
    expect(configStore.getIsTimeAttackMode).toBe(false);
  });

  it.each([
    [Const.GAME_MODE.EASY, Const.INTERVAL_INSERTION.EASY, 15],
    [Const.GAME_MODE.NORMAL, Const.INTERVAL_INSERTION.NORMAL, 10],
    [Const.GAME_MODE.HARD, Const.INTERVAL_INSERTION.HARD, 5],
  ] as const)(
    "難易度%sに対応する風船の出現間隔と移動速度を設定する",
    async (mode, expectedInsertion, expectedAnimation) => {
      const { useConfigStore } = await import("@/stores/config");
      const configStore = useConfigStore();

      configStore.saveGameMode(mode);

      expect(configStore.getInsertionSpeed).toBe(expectedInsertion);
      expect(configStore.getAnimationSpeed).toBe(expectedAnimation);
    }
  );

  it("タイムアタックの設定を保存する", async () => {
    const { useConfigStore } = await import("@/stores/config");
    const configStore = useConfigStore();

    configStore.saveGameRule(Const.GAME_RULE.TIME_ATTACK);
    configStore.saveTimeLimitSeconds(90);

    expect(configStore.getGameRule).toBe(Const.GAME_RULE.TIME_ATTACK);
    expect(configStore.getTimeLimitSeconds).toBe(90);
    expect(configStore.getIsTimeAttackMode).toBe(true);
  });

  it("表示テーマの設定を保存する", async () => {
    const { useConfigStore } = await import("@/stores/config");
    const configStore = useConfigStore();

    expect(configStore.getDisplayMode).toBe(false);

    configStore.saveDisplayMode(true);

    expect(configStore.getDisplayMode).toBe(true);
  });

  it("仮想キーボード表示の設定を保存する", async () => {
    const { useConfigStore } = await import("@/stores/config");
    const configStore = useConfigStore();

    expect(configStore.getIsVirtualKeyBoard).toBe(false);

    configStore.saveIsVirtualKeyboard(true);

    expect(configStore.getIsVirtualKeyBoard).toBe(true);
  });
});
