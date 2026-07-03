import { useBlogPostPageState } from "@/composables/useBlogPostPageState";
import type { PostIndex } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createPost = (id: string, section = "guide"): PostIndex => ({
  date: "2026-07-04",
  description: `${id} description`,
  id,
  section,
  title: `${id} title`,
  url: `blog_store/posts/${section}/${id}.md`,
});

const createStore = () => ({
  postCount: 0,
  getErrorMessage: "",
  getPostHtml: "# Title",
  receivePostIndex: vi.fn(async () => undefined),
  receiveBlogPost: vi.fn(async () => undefined),
});

describe("useBlogPostPageState", () => {
  it("記事一覧が未取得なら一覧取得後に本文を取得してHTMLへ変換する", async () => {
    const store = createStore();
    const renderer = vi.fn((markdown: string) => `<h1>${markdown}</h1>`);
    const { loadPost, postHtml } = useBlogPostPageState(store, async () => {
      return renderer;
    });

    await loadPost("guide", "first-post");

    expect(store.receivePostIndex).toHaveBeenCalledTimes(1);
    expect(store.receiveBlogPost).toHaveBeenCalledWith("guide", "first-post");
    expect(renderer).toHaveBeenCalledWith("# Title");
    expect(postHtml.value).toBe("<h1># Title</h1>");
  });

  it("記事一覧取得でエラーがある場合は本文取得せず表示HTMLを空にする", async () => {
    const store = createStore();
    store.receivePostIndex.mockImplementation(async () => {
      store.getErrorMessage = "記事一覧の取得に失敗しました。";
    });
    const rendererLoader = vi.fn();
    const { loadPost, postHtml } = useBlogPostPageState(store, rendererLoader);

    postHtml.value = "<p>old</p>";
    await loadPost("guide", "first-post");

    expect(store.receiveBlogPost).not.toHaveBeenCalled();
    expect(rendererLoader).not.toHaveBeenCalled();
    expect(postHtml.value).toBe("");
  });

  it("記事本文取得でエラーがある場合は表示HTMLを空にする", async () => {
    const store = createStore();
    store.postCount = 1;
    store.receiveBlogPost.mockImplementation(async () => {
      store.getErrorMessage = "記事本文の取得に失敗しました。";
    });
    const rendererLoader = vi.fn();
    const { loadPost, postHtml } = useBlogPostPageState(store, rendererLoader);

    postHtml.value = "<p>old</p>";
    await loadPost("guide", "first-post");

    expect(store.receivePostIndex).not.toHaveBeenCalled();
    expect(rendererLoader).not.toHaveBeenCalled();
    expect(postHtml.value).toBe("");
  });

  it("記事詳細へのルート情報を作成する", () => {
    const store = createStore();
    const { createBlogPostRoute } = useBlogPostPageState(store);

    expect(createBlogPostRoute(createPost("next-post", "features"))).toEqual({
      name: "BlogPost",
      params: {
        section: "features",
        id: "next-post",
      },
    });
  });
});
