import { computed, type Ref } from "vue";
import Const from "@/constants/const";
import type { PostIndex } from "@/types/interfaces";

/**
 * ブログ一覧のページング表示状態を作成する。
 *
 * @param pageStatus 現在ページに表示する記事一覧
 * @param totalCount 記事の総件数
 * @param currentPage 現在ページ
 */
export const useBlogPagingState = (
  pageStatus: Readonly<Ref<PostIndex[]>>,
  totalCount: Readonly<Ref<number>>,
  currentPage: Readonly<Ref<number>>
) => {
  /** ページングを表示するか */
  const showPaging = computed((): boolean => {
    return totalCount.value > 0;
  });

  /** 総ページ数 */
  const totalPages = computed((): number => {
    if (totalCount.value <= 0) {
      return 0;
    }
    return Math.ceil(totalCount.value / Const.NUMBER_OF_BLOGS);
  });

  /** 検索結果件数表示の開始位置 */
  const firstRowsCounts = computed((): number => {
    if (totalCount.value <= 0) {
      return 0;
    }

    const start = (currentPage.value - 1) * Const.NUMBER_OF_BLOGS + 1;
    return Math.min(start, totalCount.value);
  });

  /** 検索結果件数表示の終了位置 */
  const lastRowsCounts = computed((): number => {
    if (totalCount.value <= 0) {
      return 0;
    }

    const end = currentPage.value * Const.NUMBER_OF_BLOGS;
    return Math.min(end, totalCount.value);
  });

  /** ブログ一覧の件数表示テキスト */
  const listHeader = computed((): string => {
    const total = `検索結果件数: ${totalCount.value}件`;
    if (totalCount.value <= 0) {
      return total;
    }

    return `${total}(${firstRowsCounts.value}件~${lastRowsCounts.value}件を表示)`;
  });

  return {
    firstRowsCounts,
    lastRowsCounts,
    listHeader,
    pageStatus,
    showPaging,
    totalCount,
    totalPages,
  };
};
