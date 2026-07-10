import {
  deleteGameScores,
  fetchGameScoresApi,
  fetchMyGameScoresApi,
  fetchRankingsApi,
  saveGameScore,
  saveGameScoreApi,
  saveMyGameScoreApi,
  toGameScore,
  toSaveGameScoreRequest,
} from "@/services/scoreService";
import type { GameScore, GameScoreResponse } from "@/types/interfaces";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("scoreService", () => {
  const savedScore: GameScore = {
    score: 8,
    mode: 1,
    time: "00:00:30.00",
    date: "2026-07-04 10:00:00",
  };

  const newScore: GameScore = {
    score: 12,
    mode: 2,
    gameRule: "timeAttack",
    timeLimitSeconds: 60,
    time: "00:00:28.00",
    date: "2026-07-04 10:10:00",
    wpm: 32,
    accuracy: 96,
    missCount: 2,
    correctCharacterCount: 80,
  };

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("既存スコア一覧に新しいスコアを追加する", () => {
    const result = saveGameScore([savedScore], newScore);

    expect(result).toEqual([savedScore, newScore]);
  });

  it("既存スコア一覧を変更しない", () => {
    const scores = [savedScore];

    saveGameScore(scores, newScore);

    expect(scores).toEqual([savedScore]);
  });

  it("保存済みスコアを空にする", () => {
    expect(deleteGameScores()).toEqual([]);
  });

  it("保存APIリクエストではdateを除外する", () => {
    expect(toSaveGameScoreRequest(newScore)).toEqual({
      score: 12,
      mode: 2,
      gameRule: "timeAttack",
      timeLimitSeconds: 60,
      time: "00:00:28.00",
      wpm: 32,
      accuracy: 96,
      missCount: 2,
      correctCharacterCount: 80,
    });
  });

  it("APIレスポンスをゲームスコアに変換する", () => {
    const response: GameScoreResponse = {
      id: 1,
      score: 12,
      mode: 2,
      gameRule: "timeAttack",
      timeLimitSeconds: 60,
      time: "00:00:28.00",
      date: "2026-07-04 10:10:00",
      wpm: 32,
      accuracy: 96,
      missCount: 2,
      correctCharacterCount: 80,
    };

    expect(toGameScore(response)).toEqual(newScore);
  });

  it("スコア保存APIへリクエストを送信する", async () => {
    const responseBody: GameScoreResponse = {
      id: 1,
      ...newScore,
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 201,
        statusText: "Created",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await saveGameScoreApi(newScore);

    expect(result).toEqual(newScore);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/scores",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(toSaveGameScoreRequest(newScore)),
      })
    );
  });

  it("ログインユーザー別スコア保存APIへリクエストを送信する", async () => {
    const responseBody: GameScoreResponse = {
      id: 1,
      ...newScore,
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 201,
        statusText: "Created",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await saveMyGameScoreApi(newScore);

    expect(result).toEqual(newScore);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/scores",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(toSaveGameScoreRequest(newScore)),
      })
    );
  });

  it("スコア取得APIのレスポンスをゲームスコア一覧へ変換する", async () => {
    const responseBody: GameScoreResponse[] = [
      {
        id: 1,
        ...newScore,
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchGameScoresApi();

    expect(result).toEqual([newScore]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/scores",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("ログインユーザー別スコア取得APIのレスポンスをゲームスコア一覧へ変換する", async () => {
    const responseBody: GameScoreResponse[] = [
      {
        id: 1,
        ...newScore,
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchMyGameScoresApi();

    expect(result).toEqual([newScore]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/me/scores",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("ランキング取得APIへ検索条件付きリクエストを送信する", async () => {
    const responseBody: GameScoreResponse[] = [
      {
        id: 1,
        ...newScore,
      },
    ];
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchRankingsApi({
      mode: 2,
      gameRule: "timeAttack",
      timeLimitSeconds: 60,
      limit: 50,
    });

    expect(result).toEqual([newScore]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/rankings?mode=2&gameRule=timeAttack&timeLimitSeconds=60&limit=50",
      expect.objectContaining({
        method: "GET",
      })
    );
  });

  it("ランキング取得APIは検索条件なしでもリクエストを送信できる", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchRankingsApi();

    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/rankings",
      expect.objectContaining({
        method: "GET",
      })
    );
  });
});
