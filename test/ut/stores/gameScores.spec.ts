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
    vi.resetModules();
    vi.stubEnv("VITE_ENABLE_BACKEND_API", "true");
    vi.stubGlobal("localStorage", createMemoryStorage());
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
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
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/scores",
      expect.objectContaining({
        method: "POST",
      })
    );
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

  it("ログイン済みでAPI保存が401になった場合はログイン状態をクリアする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 401,
          statusText: "Unauthorized",
        })
      )
    );
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    authStore.accessToken = "access-token";
    authStore.tokenType = "Bearer";
    authStore.expiresIn = 3600;
    const gameScoresStore = useGameScoresStore();
    const score: GameScore = {
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    };

    await gameScoresStore.saveGameScoreList(score);

    expect(gameScoresStore.getGameScoreList).toEqual([score]);
    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.accessToken).toBeNull();
    expect(authStore.authNotice?.message).toBe(
      "ログインの有効期限が切れました。もう一度ログインしてください。"
    );
  });

  it("バックエンドAPI無効時はログイン状態があってもAPI保存しない", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_ENABLE_BACKEND_API", "false");
    vi.stubGlobal("localStorage", createMemoryStorage());
    setActivePinia(createPinia());
    const fetchMock = vi.fn();
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
    };

    await gameScoresStore.saveGameScoreList(score);

    expect(gameScoresStore.getGameScoreList).toEqual([score]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("ログイン済みでバックエンドAPI有効時はユーザー別スコア一覧を読み込む", async () => {
    const apiScore: GameScore = {
      score: 22,
      mode: 2,
      time: "00:00:28.00",
      date: "2026-07-10 10:00:00",
      wpm: 34,
      accuracy: 97,
      missCount: 1,
      correctCharacterCount: 82,
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            ...apiScore,
          },
        ]),
        {
          status: 200,
          statusText: "OK",
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

    await gameScoresStore.loadMyGameScoresIfAvailable();

    expect(gameScoresStore.getGameScoreList).toEqual([apiScore]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/scores",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("ユーザー別スコア一覧の取得に失敗しても既存スコアを維持する", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API error")));
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    const gameScoresStore = useGameScoresStore();
    const localScore: GameScore = {
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    };
    gameScoresStore.scores = [localScore];

    await gameScoresStore.loadMyGameScoresIfAvailable();

    expect(gameScoresStore.getGameScoreList).toEqual([localScore]);
  });

  it("ユーザー別スコア一覧の取得が401になった場合はログイン状態をクリアする", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 401,
          statusText: "Unauthorized",
        })
      )
    );
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const { useAuthStore } = await import("@/stores/auth");
    const authStore = useAuthStore();
    authStore.currentUser = {
      id: 1,
      loginEmail: "user@example.com",
    };
    authStore.accessToken = "access-token";
    authStore.tokenType = "Bearer";
    authStore.expiresIn = 3600;
    const gameScoresStore = useGameScoresStore();
    const localScore: GameScore = {
      score: 11,
      mode: 1,
      time: "00:00:33.70",
      date: "2026-05-24 12:29:45",
    };
    gameScoresStore.scores = [localScore];

    await gameScoresStore.loadMyGameScoresIfAvailable();

    expect(gameScoresStore.getGameScoreList).toEqual([localScore]);
    expect(authStore.isLoggedIn).toBe(false);
    expect(authStore.accessToken).toBeNull();
    expect(authStore.authNotice?.message).toBe(
      "ログインの有効期限が切れました。もう一度ログインしてください。"
    );
  });

  it("未ログインの場合はユーザー別スコア一覧を取得しない", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { useGameScoresStore } = await import("@/stores/gameScores");
    const gameScoresStore = useGameScoresStore();

    await gameScoresStore.loadMyGameScoresIfAvailable();

    expect(fetchMock).not.toHaveBeenCalled();
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
