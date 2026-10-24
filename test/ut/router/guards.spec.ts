import { resolveRouteAccess } from "@/router/guards";
import { routeSetting } from "@/router/routes";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

/**
 * テスト用の認証ストアを作成する。
 *
 * @param isAdmin 復元後に管理者として扱うか
 * @returns restoreSessionの呼び出しを記録する認証ストア
 */
const createAuthStore = (isAdmin: boolean) => {
  const authStore = {
    isAdmin: false,
    restoreSession: vi.fn(async () => {
      // ページ再読み込み直後は、復元が終わってから権限が分かる。
      authStore.isAdmin = isAdmin;
    }),
  };
  return authStore;
};

/**
 * ルート定義と権限判定を組み合わせたテスト用routerを作成する。
 *
 * @param authStore 認証ストア
 * @param isBackendApiEnabled バックエンドAPIを使うか
 * @returns テスト用router
 */
const createTestRouter = (
  authStore: ReturnType<typeof createAuthStore>,
  isBackendApiEnabled = true
) => {
  const router = createRouter({
    history: createMemoryHistory(),
    // 画面コンポーネントの読み込み（localStorage等への依存）を避けるため、表示部品だけ差し替える。
    routes: routeSetting.map((route) => ({
      path: route.path,
      name: route.name,
      meta: route.meta,
      component: { template: "<div />" },
    })),
  });
  router.beforeEach((to) =>
    resolveRouteAccess(to, {
      isBackendApiEnabled,
      getAuthStore: () => authStore,
    })
  );
  return router;
};

describe("router guards", () => {
  it("お知らせ管理画面は管理者専用のルートとして定義する", () => {
    const route = createTestRouter(createAuthStore(true)).resolve(
      "/admin/notifications"
    );

    expect(route.name).toBe("AdminNotificationsPage");
    expect(route.meta.requiresAdmin).toBe(true);
    expect(route.meta.requiresBackendApi).toBe(true);
  });

  it("ログイン状態を復元してから管理者を管理画面へ通す", async () => {
    const authStore = createAuthStore(true);
    const router = createTestRouter(authStore);

    await router.push("/admin/notifications");

    expect(authStore.restoreSession).toHaveBeenCalledTimes(1);
    expect(router.currentRoute.value.name).toBe("AdminNotificationsPage");
  });

  it("管理者以外はゲーム画面へ戻す", async () => {
    const authStore = createAuthStore(false);
    const router = createTestRouter(authStore);

    await router.push("/admin/notifications");

    expect(router.currentRoute.value.name).toBe("GamePage");
  });

  it("バックエンドAPIが無効な場合は管理者判定をせずにゲーム画面へ戻す", async () => {
    const authStore = createAuthStore(true);
    const router = createTestRouter(authStore, false);

    await router.push("/admin/notifications");

    expect(authStore.restoreSession).not.toHaveBeenCalled();
    expect(router.currentRoute.value.name).toBe("GamePage");
  });

  it("権限が不要な画面では認証ストアを参照しない", async () => {
    const getAuthStore = vi.fn();

    const result = await resolveRouteAccess(
      { meta: {} },
      { isBackendApiEnabled: true, getAuthStore }
    );

    expect(result).toBe(true);
    expect(getAuthStore).not.toHaveBeenCalled();
  });
});
