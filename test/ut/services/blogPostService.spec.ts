import {
  fetchBlogPostBody,
  fetchPostIndex,
} from "@/services/blogPostService";
import type { PostIndex } from "@/types/interfaces";
import Fetcher from "@/utils/fetchClient";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/fetchClient", () => ({
  default: {
    getJson: vi.fn(),
    getRequest: vi.fn(),
  },
}));

const mockedFetcher = vi.mocked(Fetcher);

const createResponse = (body: string): Response => {
  return new Response(body, {
    status: 200,
    statusText: "OK",
  });
};

describe("blogPostService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("記事一覧JSONを取得する", async () => {
    const postIndex: PostIndex[] = [
      {
        date: "2026-06-01",
        description: "説明",
        id: "first-post",
        section: "guide",
        title: "最初の記事",
        url: "blog_store/posts/guide/first-post.md",
      },
    ];
    mockedFetcher.getJson.mockResolvedValue(postIndex);

    const result = await fetchPostIndex();

    expect(result).toEqual(postIndex);
    expect(mockedFetcher.getJson).toHaveBeenCalledWith(
      "/blog_store/posts_index.json"
    );
  });

  it("posts_index.jsonにurlがある場合はurlを優先してMarkdown本文を取得する", async () => {
    const pageStatus: PostIndex[] = [
      {
        date: "2026-06-01",
        description: "説明",
        id: "first-post",
        section: "guide",
        title: "最初の記事",
        url: "blog_store/posts/guide/custom-first-post.md",
      },
    ];
    mockedFetcher.getRequest.mockResolvedValue(
      createResponse("---\ntitle: Test\n---\n# 本文")
    );

    const result = await fetchBlogPostBody(pageStatus, "guide", "first-post");

    expect(result).toBe("# 本文");
    expect(mockedFetcher.getRequest).toHaveBeenCalledWith(
      "/blog_store/posts/guide/custom-first-post.md"
    );
  });

  it("posts_index.jsonに一致する記事がない場合はsectionとidからMarkdown本文URLを組み立てる", async () => {
    mockedFetcher.getRequest.mockResolvedValue(createResponse("# 本文"));

    const result = await fetchBlogPostBody([], "guide", "missing-post");

    expect(result).toBe("# 本文");
    expect(mockedFetcher.getRequest).toHaveBeenCalledWith(
      "/blog_store/posts/guide/missing-post.md"
    );
  });
});
