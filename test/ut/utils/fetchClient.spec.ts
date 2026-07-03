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
        method: "GET",
      })
    );
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
        method: "POST",
      })
    );
  });

  it("HTTPエラーの場合はHttpErrorを投げる", async () => {
    const response = new Response("Not Found", {
      status: 404,
      statusText: "Not Found",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(Fetcher.getRequest("/api/missing")).rejects.toMatchObject({
      name: "HttpError",
      status: 404,
      statusText: "Not Found",
    });
    await expect(Fetcher.getRequest("/api/missing")).rejects.toBeInstanceOf(
      HttpError
    );
  });
});
