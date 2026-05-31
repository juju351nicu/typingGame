import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

  it("スコアを保存できる", async () => {
    const { useGameScoresStore } = await import("@/stores/gameScores");
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

    gameScoresStore.saveGameScoreList(score);

    expect(gameScoresStore.getGameScoreList).toEqual([score]);
  });

  it("保存済みスコアを削除できる", async () => {
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const gameScoresStore = useGameScoresStore();

    gameScoresStore.saveGameScoreList({
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    });
    gameScoresStore.deleteGameScoreList();

    expect(gameScoresStore.getGameScoreList).toEqual([]);
  });
});
