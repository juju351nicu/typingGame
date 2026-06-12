import { getBlogPostNavigation } from "@/composables/useBlogPostNavigation";
import type { PostIndex } from "@/types/interfaces";
import { describe, expect, it } from "vitest";

const createPost = (
  id: string,
  section: string,
  title: string
): PostIndex => ({
  id,
  section,
  title,
  date: "2026-06-13",
  description: `${title} description`,
  url: `/${section}/${id}`,
});

const posts: PostIndex[] = [
  createPost("first-post", "guide", "First post"),
  createPost("second-post", "guide", "Second post"),
  createPost("third-post", "features", "Third post"),
];

describe("useBlogPostNavigation", () => {
  it("先頭記事では前の記事を返さず次の記事を返す", () => {
    expect(getBlogPostNavigation(posts, "first-post", "guide")).toEqual({
      currentIndex: 0,
      prevPost: null,
      nextPost: posts[1],
    });
  });

  it("中間記事では前後の記事を返す", () => {
    expect(getBlogPostNavigation(posts, "second-post", "guide")).toEqual({
      currentIndex: 1,
      prevPost: posts[0],
      nextPost: posts[2],
    });
  });

  it("末尾記事では前の記事を返し次の記事を返さない", () => {
    expect(getBlogPostNavigation(posts, "third-post", "features")).toEqual({
      currentIndex: 2,
      prevPost: posts[1],
      nextPost: null,
    });
  });

  it("現在の記事が見つからない場合は前後の記事を返さない", () => {
    expect(getBlogPostNavigation(posts, "missing-post", "guide")).toEqual({
      currentIndex: -1,
      prevPost: null,
      nextPost: null,
    });
  });
});
