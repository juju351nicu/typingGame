import {
  fetchCurrentUserApi,
  loginApi,
  logoutApi,
  registerUserApi,
} from "@/services/authService";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("authService", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("ユーザー登録APIへリクエストを送信する", async () => {
    const responseBody = {
      id: 1,
      loginEmail: "user@example.com",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 201,
        statusText: "Created",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await registerUserApi({
      loginEmail: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/users",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("ログインAPIへリクエストを送信する", async () => {
    const responseBody = {
      user: {
        id: 1,
        loginEmail: "user@example.com",
      },
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await loginApi({
      loginEmail: "user@example.com",
      password: "password123",
    });

    expect(result).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/auth/login",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });

  it("ログイン中ユーザー取得APIへリクエストを送信する", async () => {
    const responseBody = {
      id: 1,
      loginEmail: "user@example.com",
    };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(responseBody), {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchCurrentUserApi();

    expect(result).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/auth/me",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
      })
    );
  });

  it("ログアウトAPIへリクエストを送信する", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 200,
        statusText: "OK",
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await logoutApi();

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8091/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      })
    );
  });
});
