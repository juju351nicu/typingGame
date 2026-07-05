import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameScore } from "@/types/interfaces";

const createMemoryStorage = (): Storage => {
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
  };
};

describe("gameScores store", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("スコアを保存できる", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          score: 11,
          mode: 1,
          time: "00:00:33.70",
          date: "2026-05-24 12:29:45",
          wpm: 16,
          accuracy: 98,
          missCount: 1,
          correctCharacterCount: 42,
        }),
        {
          status: 201,
          statusText: "Created",
        }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    const gameScoresStore = useGameScoresStore();
    const score: GameScore = {
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
      wpm: 16,
      accuracy: 98,
      missCount: 1,
      correctCharacterCount: 42,
    };

    await gameScoresStore.saveGameScoreList(score);

    expect(gameScoresStore.getGameScoreList).toEqual([score]);
    expect(fetchMock).toHaveBeenCalled();
  });

  it("未ログインの場合はAPI保存せずにスコアを保存できる", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const gameScoresStore = useGameScoresStore();
    const score: GameScore = {
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    };

    await gameScoresStore.saveGameScoreList(score);

    expect(gameScoresStore.getGameScoreList).toEqual([score]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ログイン済みでAPI保存に失敗してもスコアを保存できる", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API error")));
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    const gameScoresStore = useGameScoresStore();
    const score: GameScore = {
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    };

    await gameScoresStore.saveGameScoreList(score);

    expect(gameScoresStore.getGameScoreList).toEqual([score]);
  });

  it("保存済みスコアを削除できる", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const gameScoresStore = useGameScoresStore();

    await gameScoresStore.saveGameScoreList({
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    });
    gameScoresStore.deleteGameScoreList();

    expect(gameScoresStore.getGameScoreList).toEqual([]);
  });
});
