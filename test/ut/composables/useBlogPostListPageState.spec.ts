import { useBlogPostListPageState } from "@/composables/useBlogPostListPageState";
import type { PostIndex } from "@/types/interfaces";
import { describe, expect, it, vi } from "vitest";

const createPost = (id: string): PostIndex => ({
  date: "2026-07-04",
  description: `${id} description`,
  id,
  section: "guide",
  title: `${id} title`,
  url: `blog_store/posts/guide/${id}.md`,
});

const createStore = () => {
  const posts = [
    createPost("first"),
    createPost("second"),
    createPost("third"),
    createPost("fourth"),
    createPost("fifth"),
  ];

  return {
    posts,
    getPostRangeByPage: vi.fn((pageNumber: number) => {
      const pageSize = 4;
      return posts.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    }),
    savePrevPageNo: vi.fn(),
  };
};

describe("useBlogPostListPageState", () => {
  it("URLクエリのページ番号を1以上の整数へ正規化する", () => {
    const store = createStore();
    const pageState = useBlogPostListPageState(store);

    expect(pageState.normalizePageNumber("2")).toBe(2);
    expect(pageState.normalizePageNumber(["3", "4"])).toBe(3);
    expect(pageState.normalizePageNumber(undefined)).toBe(1);
    expect(pageState.normalizePageNumber(null)).toBe(1);
    expect(pageState.normalizePageNumber("abc")).toBe(1);
    expect(pageState.normalizePageNumber("0")).toBe(1);
    expect(pageState.normalizePageNumber("-1")).toBe(1);
    expect(pageState.normalizePageNumber("1.5")).toBe(1);
  });

  it("指定ページの記事一覧を反映する", () => {
    const store = createStore();
    const pageState = useBlogPostListPageState(store);

    pageState.setPage(2);

    expect(pageState.currentPage.value).toBe(2);
    expect(store.getPostRangeByPage).toHaveBeenCalledWith(2);
    expect(pageState.pageStatus.value).toEqual([store.posts[4]]);
  });

  it("不正なページ番号を指定した場合は1ページ目を反映する", () => {
    const store = createStore();
    const pageState = useBlogPostListPageState(store);

    pageState.setPage(0);

    expect(pageState.currentPage.value).toBe(1);
    expect(store.getPostRangeByPage).toHaveBeenCalledWith(1);
    expect(pageState.pageStatus.value).toEqual(store.posts.slice(0, 4));
  });

  it("URLクエリのページ番号を現在ページへ反映する", () => {
    const store = createStore();
    const pageState = useBlogPostListPageState(store);

    pageState.setPageFromQuery("2");
    pageState.loadCurrentPage();

    expect(pageState.currentPage.value).toBe(2);
    expect(pageState.pageStatus.value).toEqual([store.posts[4]]);
  });

  it("記事詳細ルートを作成し、現在ページを前ページ番号として保存する", () => {
    const store = createStore();
    const pageState = useBlogPostListPageState(store);
    pageState.currentPage.value = 2;

    expect(pageState.createPostDetailRoute("guide", "fifth")).toEqual({
      name: "BlogPost",
      params: {
        section: "guide",
        id: "fifth",
      },
    });
    expect(store.savePrevPageNo).toHaveBeenCalledWith(2);
  });
});
