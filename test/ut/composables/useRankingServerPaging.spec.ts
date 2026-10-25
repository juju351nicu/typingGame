import {
  MAX_SERVER_PAGE_SIZE,
  toPageOffset,
  toServerPageSize,
  useRankingServerPaging,
  type RankingFilter,
} from "@/composables/useRankingServerPaging";
import type {
  GameScore,
  RankingPage,
  RankingPageQuery,
} from "@/types/interfaces";
import { flushPromises } from "@vue/test-utils";
import { nextTick, ref } from "vue";
import { describe, expect, it, vi } from "vitest";

const createScore = (score: number): GameScore => ({
  score,
  mode: 1,
  time: "00:00:30.00",
  date: "2026-05-24 12:00:00",
});

const createPage = (
  query: Pick<RankingPageQuery, "page" | "size">,
  totalCount = 25
): RankingPage => ({
  items: [createScore(30 - query.page), createScore(20 - query.page)],
  page: query.page,
  size: query.size,
  totalCount,
  totalPages: Math.max(1, Math.ceil(totalCount / query.size)),
});

/** テスト用にcomposableを組み立てる。 */
const setup = (isEnabledValue = true) => {
  const isEnabled = ref(isEnabledValue);
  const filter = ref<RankingFilter>({
    mode: null,
    gameRule: null,
    timeLimitSeconds: null,
  });
  const itemsPerPage = ref(10);
  const fetchPage = vi.fn(async (query: RankingPageQuery) => createPage(query));
  const paging = useRankingServerPaging({
    isEnabled,
    filter,
    itemsPerPage,
    fetchPage,
  });
  return { isEnabled, filter, itemsPerPage, fetchPage, paging };
};

describe("toServerPageSize", () => {
  it("1〜上限の件数はそのまま使う", () => {
    expect(toServerPageSize(1)).toBe(1);
    expect(toServerPageSize(20)).toBe(20);
    expect(toServerPageSize(MAX_SERVER_PAGE_SIZE)).toBe(MAX_SERVER_PAGE_SIZE);
  });

  it("全件表示（-1）や上限超えはAPIの最大件数に丸める", () => {
    expect(toServerPageSize(-1)).toBe(MAX_SERVER_PAGE_SIZE);
    expect(toServerPageSize(0)).toBe(MAX_SERVER_PAGE_SIZE);
    expect(toServerPageSize(MAX_SERVER_PAGE_SIZE + 1)).toBe(
      MAX_SERVER_PAGE_SIZE
    );
  });
});

describe("toPageOffset", () => {
  it("ページ番号から先頭までの件数を求める", () => {
    expect(toPageOffset(1, 10)).toBe(0);
    expect(toPageOffset(3, 10)).toBe(20);
  });
});

describe("useRankingServerPaging", () => {
  it("有効な場合は1ページ目を取得し、全体での順位を付ける", async () => {
    const { fetchPage, paging } = setup();
    await flushPromises();

    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith({
      mode: null,
      gameRule: null,
      timeLimitSeconds: null,
      page: 1,
      size: 10,
    });
    expect(paging.rankingItems.value.map((item) => item.rank)).toEqual([1, 2]);
    expect(paging.isLoading.value).toBe(false);
    expect(paging.hasError.value).toBe(false);
  });

  it("無効な場合は取得せず、読み込み中・エラーにもしない", async () => {
    const { fetchPage, paging } = setup(false);
    await flushPromises();

    expect(fetchPage).not.toHaveBeenCalled();
    expect(paging.rankingItems.value).toEqual([]);
    expect(paging.isLoading.value).toBe(false);
    expect(paging.hasError.value).toBe(false);
  });

  it("応答を待つ間は読み込み中にする", async () => {
    let resolvePage: (page: RankingPage) => void = () => {};
    const fetchPage = vi.fn(
      () =>
        new Promise<RankingPage>((resolve) => {
          resolvePage = resolve;
        })
    );
    const paging = useRankingServerPaging({
      isEnabled: ref(true),
      filter: ref<RankingFilter>({}),
      itemsPerPage: ref(10),
      fetchPage,
    });

    expect(paging.isLoading.value).toBe(true);

    resolvePage(createPage({ page: 1, size: 10 }));
    await flushPromises();
    expect(paging.isLoading.value).toBe(false);
  });

  it("無効から有効へ切り替わったときに取得する", async () => {
    const { fetchPage, isEnabled } = setup(false);
    await flushPromises();

    isEnabled.value = true;
    await flushPromises();

    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("ページを変えるとそのページ番号をAPIへ渡し、順位をoffset分ずらす", async () => {
    const { fetchPage, paging } = setup();
    await flushPromises();

    paging.changePage(2);
    await flushPromises();

    expect(fetchPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2, size: 10 })
    );
    expect(paging.rankingItems.value.map((item) => item.rank)).toEqual([
      11, 12,
    ]);
  });

  it("ページ番号は1〜総ページ数の範囲に収める", async () => {
    const { paging } = setup();
    await flushPromises();

    paging.changePage(0);
    expect(paging.page.value).toBe(1);
    paging.changePage(99);
    expect(paging.page.value).toBe(3);
  });

  it("取得前はページ番号を1に留める", () => {
    const { paging } = setup(false);

    paging.changePage(2);

    expect(paging.page.value).toBe(1);
  });

  it("絞り込み条件が変わったら1ページ目から1回だけ取得し直す", async () => {
    const { fetchPage, filter, paging } = setup();
    await flushPromises();
    paging.changePage(3);
    await flushPromises();
    fetchPage.mockClear();

    filter.value = { ...filter.value, mode: 2 };
    await flushPromises();

    expect(paging.page.value).toBe(1);
    expect(fetchPage).toHaveBeenCalledTimes(1);
    expect(fetchPage).toHaveBeenCalledWith(
      expect.objectContaining({ mode: 2, page: 1 })
    );
  });

  it("同じ内容の条件オブジェクトが作り直されただけでは取得し直さない", async () => {
    const { fetchPage, filter } = setup();
    await flushPromises();
    fetchPage.mockClear();

    filter.value = { ...filter.value };
    await flushPromises();

    expect(fetchPage).not.toHaveBeenCalled();
  });

  it("表示行数が変わったら1ページ目へ戻り、全件表示は最大件数で取得する", async () => {
    const { fetchPage, itemsPerPage, paging } = setup();
    await flushPromises();
    paging.changePage(2);
    await flushPromises();

    itemsPerPage.value = -1;
    await flushPromises();

    expect(paging.page.value).toBe(1);
    expect(fetchPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, size: MAX_SERVER_PAGE_SIZE })
    );
  });

  it("古いリクエストの応答が後から届いても、最新の結果を上書きしない", async () => {
    const isEnabled = ref(true);
    const filter = ref<RankingFilter>({ mode: null });
    const itemsPerPage = ref(10);
    const resolvers: ((page: RankingPage) => void)[] = [];
    const fetchPage = vi.fn(
      () =>
        new Promise<RankingPage>((resolve) => {
          resolvers.push(resolve);
        })
    );
    const paging = useRankingServerPaging({
      isEnabled,
      filter,
      itemsPerPage,
      fetchPage,
    });
    await nextTick();
    filter.value = { mode: 2 };
    await nextTick();

    // 新しいリクエストが先に、古いリクエストが後に返る。
    const latestPage = createPage({ page: 1, size: 10 }, 3);
    const stalePage = createPage({ page: 1, size: 10 }, 99);
    resolvers[1](latestPage);
    await flushPromises();
    resolvers[0](stalePage);
    await flushPromises();

    expect(fetchPage).toHaveBeenCalledTimes(2);
    expect(paging.rankingPage.value).toEqual(latestPage);
    expect(paging.isLoading.value).toBe(false);
  });

  it("古いリクエストが後から失敗しても、最新の表示をエラーや読み込み中に戻さない", async () => {
    const filter = ref<RankingFilter>({ mode: null });
    const settlers: {
      resolve: (page: RankingPage) => void;
      reject: (error: Error) => void;
    }[] = [];
    const fetchPage = vi.fn(
      () =>
        new Promise<RankingPage>((resolve, reject) => {
          settlers.push({ resolve, reject });
        })
    );
    const paging = useRankingServerPaging({
      isEnabled: ref(true),
      filter,
      itemsPerPage: ref(10),
      fetchPage,
    });
    await nextTick();
    filter.value = { mode: 2 };
    await nextTick();

    const latestPage = createPage({ page: 1, size: 10 }, 3);
    settlers[1].resolve(latestPage);
    await flushPromises();
    settlers[0].reject(new Error("timeout"));
    await flushPromises();

    expect(paging.rankingPage.value).toEqual(latestPage);
    expect(paging.hasError.value).toBe(false);
    expect(paging.isLoading.value).toBe(false);
  });

  it("新しいリクエストを待っている間に古いリクエストが返っても、読み込み中を維持する", async () => {
    const filter = ref<RankingFilter>({ mode: null });
    const resolvers: ((page: RankingPage) => void)[] = [];
    const fetchPage = vi.fn(
      () =>
        new Promise<RankingPage>((resolve) => {
          resolvers.push(resolve);
        })
    );
    const paging = useRankingServerPaging({
      isEnabled: ref(true),
      filter,
      itemsPerPage: ref(10),
      fetchPage,
    });
    await nextTick();
    filter.value = { mode: 2 };
    await nextTick();

    resolvers[0](createPage({ page: 1, size: 10 }, 99));
    await flushPromises();

    expect(paging.isLoading.value).toBe(true);
    expect(paging.rankingPage.value).toBeNull();
  });

  it("取得に失敗しても、直前に表示できていたページを維持する", async () => {
    const { fetchPage, paging } = setup();
    await flushPromises();
    const previousPage = paging.rankingPage.value;
    fetchPage.mockRejectedValueOnce(new Error("network"));

    paging.changePage(2);
    await flushPromises();

    expect(paging.rankingPage.value).toEqual(previousPage);
    expect(paging.hasError.value).toBe(true);
    expect(paging.isLoading.value).toBe(false);
  });

  it("取得に失敗したページをもう一度選ぶと、取得し直す", async () => {
    const { fetchPage, paging } = setup();
    await flushPromises();
    fetchPage.mockRejectedValueOnce(new Error("network"));
    paging.changePage(2);
    await flushPromises();

    paging.changePage(2);
    await flushPromises();

    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );
    expect(paging.rankingPage.value?.page).toBe(2);
    expect(paging.hasError.value).toBe(false);
  });
});
