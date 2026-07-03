import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PostIndex } from "@/types/interfaces";

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

const createPost = (id: string): PostIndex => ({
  date: "2026-07-04",
  description: `${id} description`,
  id,
  section: "guide",
  title: `${id} title`,
  url: `blog_store/posts/guide/${id}.md`,
});

describe("blogPosts store", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", createMemoryStorage());
    setActivePinia(createPinia());
  });

  it("指定ページの記事一覧を取得できる", async () => {
    const { useBlogPostsStore } = await import("@/stores/blogPosts");
    const blogPostsStore = useBlogPostsStore();
    const posts = [
      createPost("first"),
      createPost("second"),
      createPost("third"),
      createPost("fourth"),
      createPost("fifth"),
    ];
    blogPostsStore.pageStatus = posts;

    expect(blogPostsStore.getPostRangeByPage(1)).toEqual(posts.slice(0, 4));
    expect(blogPostsStore.getPostRangeByPage(2)).toEqual([posts[4]]);
  });

  it("旧getter名でも指定ページの記事一覧を取得できる", async () => {
    const { useBlogPostsStore } = await import("@/stores/blogPosts");
    const blogPostsStore = useBlogPostsStore();
    const posts = [
      createPost("first"),
      createPost("second"),
      createPost("third"),
      createPost("fourth"),
      createPost("fifth"),
    ];
    blogPostsStore.pageStatus = posts;

    expect(blogPostsStore.getPostRageByPage(2)).toEqual(
      blogPostsStore.getPostRangeByPage(2)
    );
  });
});
