import type { PostIndex } from "@/types/interfaces";
import { ref } from "vue";
import type { LocationQueryValue } from "vue-router";

type PageQueryValue = LocationQueryValue | LocationQueryValue[] | undefined;

interface BlogPostListStore {
  /** 指定ページの記事一覧を取得する */
  getPostRangeByPage: (pageNumber: number) => PostIndex[];
  /** 一覧へ戻るための前回ページ番号を保存する */
  savePrevPageNo: (pageNumber: number) => void;
}

/**
 * ブログ一覧画面で扱うページング状態を管理する。
 *
 * URLクエリ由来のページ番号は不正値が入りやすいため、1以上の整数に正規化して
 * 空ページ表示やNaNページを防ぐ。
 *
 * @param blogPostsStore ブログ記事ストア
 */
export const useBlogPostListPageState = (
  blogPostsStore: BlogPostListStore
) => {
  /** 記事の一覧情報 */
  const pageStatus = ref<PostIndex[]>([]);

  /** 現在のページ */
  const currentPage = ref<number>(1);

  /**
   * URLクエリからページ番号を取得する。
   *
   * @param value pageNumberクエリの値
   * @returns 1以上の整数ページ番号
   */
  const normalizePageNumber = (value: PageQueryValue): number => {
    const rawValue = Array.isArray(value) ? value[0] : value;
    const pageNumber = Number(rawValue);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      return 1;
    }

    return pageNumber;
  };

  /**
   * 指定ページの記事一覧を反映する。
   *
   * @param pageNumber 表示するページ番号
   */
  const setPage = (pageNumber: number): void => {
    currentPage.value = normalizePageNumber(String(pageNumber));
    pageStatus.value = blogPostsStore.getPostRangeByPage(currentPage.value);
  };

  /**
   * URLクエリのページ番号を現在ページへ反映する。
   *
   * @param pageNumberQuery pageNumberクエリの値
   */
  const setPageFromQuery = (pageNumberQuery: PageQueryValue): void => {
    currentPage.value = normalizePageNumber(pageNumberQuery);
  };

  /** 現在ページの記事一覧を読み込む。 */
  const loadCurrentPage = (): void => {
    pageStatus.value = blogPostsStore.getPostRangeByPage(currentPage.value);
  };

  /**
   * 記事詳細へのルート情報を作成する。
   *
   * @param section 記事セクション
   * @param id 記事ID
   * @returns vue-routerへ渡すルート情報
   */
  const createPostDetailRoute = (section: string, id: string) => {
    blogPostsStore.savePrevPageNo(currentPage.value);
    return {
      name: "BlogPost",
      params: { section, id },
    };
  };

  return {
    createPostDetailRoute,
    currentPage,
    loadCurrentPage,
    normalizePageNumber,
    pageStatus,
    setPage,
    setPageFromQuery,
  };
};
