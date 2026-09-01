import Fetcher, { HttpError } from "@/utils/fetchClient";
import { afterEach, describe, expect, it, vi } from "vitest";

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

describe("fetchClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.credentials).toBeUndefined();
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
        method: "POST",
      })
    );
    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.credentials).toBeUndefined();
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

  it("保存済みtokenがある場合はAuthorizationヘッダーを付ける", async () => {
    vi.stubGlobal(
      "sessionStorage",
      createMemoryStorage({
        "typingGame.authToken": JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
          expiresIn: 3600,
        }),
      })
    );
    const response = new Response("{}", {
      status: 200,
      statusText: "OK",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await Fetcher.getRequest("/api/me/scores");

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer access-token");
  });

  it("API以外のリクエストにはAuthorizationヘッダーを付けない", async () => {
    vi.stubGlobal(
      "sessionStorage",
      createMemoryStorage({
        "typingGame.authToken": JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
        }),
      })
    );
    const response = new Response("{}", {
      status: 200,
      statusText: "OK",
    });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await Fetcher.getRequest("/blog_store/posts-index.json");

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
    expect(options.credentials).toBeUndefined();
  });

  it("APIと同じ文字列で始まる外部originには認証情報を付けない", async () => {
    vi.stubGlobal(
      "sessionStorage",
      createMemoryStorage({
        "typingGame.authToken": JSON.stringify({
          accessToken: "access-token",
          tokenType: "Bearer",
        }),
      })
    );
    const response = new Response("{}", { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await Fetcher.getRequest("http://localhost:8091.evil.example/api/scores");

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    const headers = options.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
    expect(options.credentials).toBeUndefined();
  });

  it("リクエストに10秒のタイムアウトを設定する", async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout");
    const response = new Response("{}", { status: 200 });
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);

    await Fetcher.getRequest("/api/scores");

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(timeoutSpy).toHaveBeenCalledWith(10_000);
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
