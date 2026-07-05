import Fetcher, { HttpError } from "@/utils/fetchClient";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("fetchClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GETリクエストを送信する", async () => {
    const response = new Response("{}", {
      status: 200,
      statusText: "OK",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await Fetcher.getRequest("/api/scores");

    expect(result).toBe(response);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scores",
      expect.objectContaining({
        credentials: "include",
        method: "GET",
      })
    );
  });

  it("GETリクエストのJSONレスポンスを取得する", async () => {
    const responseBody = { scores: [{ score: 10 }] };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      statusText: "OK",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await Fetcher.getJson<typeof responseBody>("/api/scores");

    expect(result).toEqual(responseBody);
  });

  it("POSTリクエストをJSON文字列で送信する", async () => {
    const response = new Response("{}", {
      status: 200,
      statusText: "OK",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await Fetcher.postRequest("/api/scores", { score: 10 });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/scores",
      expect.objectContaining({
        body: JSON.stringify({ score: 10 }),
        credentials: "include",
        method: "POST",
      })
    );
  });

  it("POSTリクエストのJSONレスポンスを取得する", async () => {
    const responseBody = { id: 1, score: 10 };
    const response = new Response(JSON.stringify(responseBody), {
      status: 200,
      statusText: "OK",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await Fetcher.postJson<typeof responseBody>("/api/scores", {
      score: 10,
    });

    expect(result).toEqual(responseBody);
  });

  it("HTTPエラーの場合はHttpErrorを投げる", async () => {
    const responseBody = {
      fieldErrors: [
        {
          errorCode: "NOT_FOUND",
          field: "",
          message: "見つかりません。",
        },
      ],
    };
    const response = new Response(JSON.stringify(responseBody), {
      status: 404,
      statusText: "Not Found",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(Fetcher.getRequest("/api/missing")).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
      statusText: "Not Found",
      errorResponse: responseBody,
    });
    await expect(Fetcher.getRequest("/api/missing")).rejects.toBeInstanceOf(
      HttpError
    );
  });
});
