import { ref } from "vue";
import { describe, expect, it } from "vitest";
import { useBlogPagingState } from "@/composables/useBlogPagingState";
import type { PostIndex } from "@/types/interfaces";

const createPost = (id: string): PostIndex => ({
  date: "2026-07-04",
  description: `${id} description`,
  id,
  section: "guide",
  title: `${id} title`,
  url: `blog_store/posts/guide/${id}.md`,
});

describe("useBlogPagingState", () => {
  it("記事がない場合はページングを非表示にする", () => {
    const pageStatus = ref<PostIndex[]>([]);
    const totalCount = ref(0);
    const currentPage = ref(1);
    const pagingState = useBlogPagingState(pageStatus, totalCount, currentPage);

    expect(pagingState.showPaging.value).toBe(false);
    expect(pagingState.totalPages.value).toBe(0);
    expect(pagingState.listHeader.value).toBe("検索結果件数: 0件");
  });

  it("1ページ目の表示範囲と総ページ数を返す", () => {
    const pageStatus = ref([createPost("first"), createPost("second")]);
    const totalCount = ref(5);
    const currentPage = ref(1);
    const pagingState = useBlogPagingState(pageStatus, totalCount, currentPage);

    expect(pagingState.showPaging.value).toBe(true);
    expect(pagingState.totalPages.value).toBe(2);
    expect(pagingState.firstRowsCounts.value).toBe(1);
    expect(pagingState.lastRowsCounts.value).toBe(4);
    expect(pagingState.listHeader.value).toBe(
      "検索結果件数: 5件(1件~4件を表示)"
    );
  });

  it("最終ページでは総件数を超えない表示範囲を返す", () => {
    const pageStatus = ref([createPost("fifth")]);
    const totalCount = ref(5);
    const currentPage = ref(2);
    const pagingState = useBlogPagingState(pageStatus, totalCount, currentPage);

    expect(pagingState.firstRowsCounts.value).toBe(5);
    expect(pagingState.lastRowsCounts.value).toBe(5);
    expect(pagingState.listHeader.value).toBe(
      "検索結果件数: 5件(5件~5件を表示)"
    );
  });

  it("総件数が1ページに収まる場合は総ページ数を1にする", () => {
    const pageStatus = ref([createPost("first")]);
    const totalCount = ref(1);
    const currentPage = ref(1);
    const pagingState = useBlogPagingState(pageStatus, totalCount, currentPage);

    expect(pagingState.totalPages.value).toBe(1);
    expect(pagingState.listHeader.value).toBe(
      "検索結果件数: 1件(1件~1件を表示)"
    );
  });
});
