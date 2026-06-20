import { createPinia, setActivePinia } from "pinia";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { App } from "vue";
import type { GameScore } from "@/types/interfaces";

const createMemoryStorage = (initialValues: Record<string, string> = {}) => {
  const store = new Map<string, string>(Object.entries(initialValues));
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

const setupPersistedPinia = (initialValues: Record<string, string>) => {
  vi.stubGlobal("localStorage", createMemoryStorage(initialValues));

  const pinia = createPinia();
  pinia.use(createPersistedState());
  const appMock = {
    config: {
      globalProperties: {},
    },
    provide: vi.fn(),
  } as unknown as App;
  pinia.install(appMock);
  setActivePinia(pinia);
};

describe("persisted stores", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("localStorageの保存済みスコアを復元する", async () => {
    const savedScore: GameScore = {
      score: 18,
      mode: 2,
      time: "00:00:28.40",
      date: "2026-06-13 10:15:00",
      wpm: 38,
      accuracy: 95,
      missCount: 2,
      correctCharacterCount: 64,
    };
    setupPersistedPinia({
      gameScores: JSON.stringify({
        scores: [savedScore],
        isLoading: false,
      }),
    });
    const { useGameScoresStore } = await import("@/stores/gameScores");

    const gameScoresStore = useGameScoresStore();

    expect(gameScoresStore.getGameScoreList).toEqual([savedScore]);
  });

  it("localStorageの設定値を復元する", async () => {
    setupPersistedPinia({
      config: JSON.stringify({
        mode: 2,
        isDarkMode: false,
        isVirtualKeyBoard: true,
        wordStyleWidth: 200,
        insertion: 2000,
        animation: 15,
      }),
    });
    const { useConfigStore } = await import("@/stores/config");

    const configStore = useConfigStore();

    expect(configStore.getGameMode).toBe(2);
    expect(configStore.getIsVirtualKeyBoard).toBe(true);
    expect(configStore.getInsertionSpeed).toBe(2000);
    expect(configStore.getAnimationSpeed).toBe(15);
  });
});
