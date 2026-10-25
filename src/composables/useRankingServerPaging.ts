import { computed, ref, watch, type Ref } from "vue";
import Util from "@/utils/gameUtils";
import { fetchRankingsPageApi } from "@/services/scoreService";
import type {
  RankingPage,
  RankingPageQuery,
  RankingQuery,
  RankingScore,
} from "@/types/interfaces";

/** ページ単位のランキング取得APIで指定できる最大件数（BEのvalidationと同じ値） */
export const MAX_SERVER_PAGE_SIZE = 100;

/** ランキングの絞り込み条件 */
export type RankingFilter = Omit<RankingQuery, "limit">;

/** useRankingServerPaging の引数 */
interface UseRankingServerPagingOptions {
  /** サーバーサイドページングで取得するか */
  isEnabled: Readonly<Ref<boolean>>;
  /** ランキングの絞り込み条件 */
  filter: Readonly<Ref<RankingFilter>>;
  /** 1ページあたりの行数。-1の場合は全件表示の選択 */
  itemsPerPage: Readonly<Ref<number>>;
  /** ページ取得処理。テストで差し替えられるよう引数で受け取る */
  fetchPage?: (query: RankingPageQuery) => Promise<RankingPage>;
}

/**
 * 画面の表示行数を、APIへ渡す1ページあたりの件数へ変換する。
 *
 * 全件表示（-1）や上限を超える値は、APIが受け付ける最大件数に丸める。
 * 全体ランキングは件数が増え続けるため、全件を一度に取得しない。
 *
 * @param itemsPerPage 画面で選択された表示行数
 * @returns APIへ渡す1ページあたりの件数
 */
export const toServerPageSize = (itemsPerPage: number): number => {
  if (itemsPerPage <= 0 || itemsPerPage > MAX_SERVER_PAGE_SIZE) {
    return MAX_SERVER_PAGE_SIZE;
  }
  return itemsPerPage;
};

/**
 * ページ番号から、そのページより前にある件数（offset）を求める。
 *
 * @param page ページ番号（1始まり）
 * @param size 1ページあたりの件数
 * @returns ページ先頭までの件数
 */
export const toPageOffset = (page: number, size: number): number => {
  return (page - 1) * size;
};

/**
 * 全体ランキング表のページ番号をサーバーへ渡し、表示するページだけを取得する。
 *
 * 絞り込み条件・表示行数が変わったときは1ページ目へ戻す。
 * 古いリクエストの応答が後から届いても、最新の条件の表示を上書きしない。
 *
 * @param options 取得条件
 * @returns ページ番号、取得結果、表示用の行と操作
 */
export const useRankingServerPaging = (
  options: UseRankingServerPagingOptions
) => {
  const fetchPage = options.fetchPage ?? fetchRankingsPageApi;

  /** 現在のページ番号（1始まり） */
  const page = ref(1);

  /** 直近に取得できたページ */
  const rankingPage = ref<RankingPage | null>(null);

  /** 取得中か */
  const isLoading = ref(false);

  /** 取得に失敗したか */
  const hasError = ref(false);

  /** APIへ渡す1ページあたりの件数 */
  const pageSize = computed((): number => {
    return toServerPageSize(options.itemsPerPage.value);
  });

  /** 絞り込み条件の比較用キー。オブジェクトの再生成だけでは再取得しない */
  const filterKey = computed((): string => {
    return JSON.stringify(options.filter.value);
  });

  /** 表に表示する行。順位はページ先頭までの件数を足した全体順位 */
  const rankingItems = computed((): RankingScore[] => {
    const current = rankingPage.value;
    if (!current) {
      return [];
    }
    return Util.createPagedRankingScores(
      current.items,
      toPageOffset(current.page, current.size)
    );
  });

  /** 発行したリクエストの通し番号。最新の応答だけを反映するために使う */
  let latestRequestId = 0;

  /** 現在の条件でページを取得する。 */
  const loadPage = async (): Promise<void> => {
    if (!options.isEnabled.value) {
      return;
    }

    const requestId = ++latestRequestId;
    isLoading.value = true;
    try {
      const result = await fetchPage({
        ...options.filter.value,
        page: page.value,
        size: pageSize.value,
      });
      if (requestId === latestRequestId) {
        rankingPage.value = result;
        hasError.value = false;
      }
    } catch {
      // 取得に失敗しても、直前に表示できていたページは維持する。
      if (requestId === latestRequestId) {
        hasError.value = true;
      }
    } finally {
      if (requestId === latestRequestId) {
        isLoading.value = false;
      }
    }
  };

  /**
   * 表示するページを変更する。
   *
   * @param nextPage 表示するページ番号
   */
  const changePage = (nextPage: number): void => {
    const totalPages = rankingPage.value?.totalPages ?? 1;
    const clampedPage = Math.min(Math.max(nextPage, 1), totalPages);
    // 取得に失敗したページをもう一度選んだ場合は、番号が変わらずwatcherが動かないため直接取得し直す。
    if (clampedPage === page.value) {
      void loadPage();
      return;
    }
    page.value = clampedPage;
  };

  // 条件が変わったら、存在しないページに残らないよう先頭へ戻す。
  // このwatcherを先に登録し、下の取得処理が戻した後のページ番号で1回だけ動くようにする。
  watch([filterKey, pageSize], () => {
    page.value = 1;
  });

  watch(
    [options.isEnabled, filterKey, pageSize, page],
    () => {
      void loadPage();
    },
    { immediate: true }
  );

  return {
    page,
    pageSize,
    rankingPage,
    rankingItems,
    isLoading,
    hasError,
    changePage,
    loadPage,
  };
};
