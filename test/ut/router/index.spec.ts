import { routeSetting } from "@/router/routes";
import { describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: routeSetting,
  });
};

describe("router", () => {
  it("静的ページのURLを正しいルートへ解決する", () => {
    const router = createTestRouter();

    expect(router.resolve("/aboutUs").name).toBe("AboutUs");
    expect(router.resolve("/blogPostList").name).toBe("BlogPostList");
    expect(router.resolve("/login").name).toBe("LoginPage");
  });

  it("ブログ詳細URLを動的ルートへ解決する", () => {
    const router = createTestRouter();
    const route = router.resolve("/guide/example-post");

    expect(route.name).toBe("BlogPost");
    expect(route.params).toEqual({
      section: "guide",
      id: "example-post",
    });
  });
});
