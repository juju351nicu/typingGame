import {
  compareTableValues,
  getNextSort,
  useDataTableView,
} from "@/composables/useDataTableView";
import { nextTick, ref } from "vue";
import { describe, expect, it } from "vitest";

interface Row {
  name: string;
  score: number | null;
}

const rows: Row[] = [
  { name: "b", score: 20 },
  { name: "a", score: 30 },
  { name: "c", score: null },
  { name: "d", score: 10 },
];

describe("useDataTableView", () => {
  it("数値は大小、文字列は辞書順で比較し、空値は末尾へ寄せる", () => {
    expect(compareTableValues(1, 2)).toBeLessThan(0);
    expect(compareTableValues("b", "a")).toBeGreaterThan(0);
    expect(compareTableValues(null, 1)).toBeGreaterThan(0);
    expect(compareTableValues(1, undefined)).toBeLessThan(0);
  });

  it("並び順は昇順・降順・解除の順に切り替わる", () => {
    const asc = getNextSort(null, "score");
    expect(asc).toEqual({ key: "score", order: "asc" });
    const desc = getNextSort(asc, "score");
    expect(desc).toEqual({ key: "score", order: "desc" });
    expect(getNextSort(desc, "score")).toBeNull();
    expect(getNextSort(desc, "name")).toEqual({ key: "name", order: "asc" });
  });

  it("指定件数ごとにページを分け、表示範囲の文言を作る", async () => {
    const items = ref(rows);
    const itemsPerPage = ref(3);
    const view = useDataTableView(items, itemsPerPage);

    expect(view.pageCount.value).toBe(2);
    expect(view.visibleItems.value.map((row) => row.name)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(view.pageText.value).toBe("1-3 of 4");

    view.page.value = 2;
    await nextTick();
    expect(view.visibleItems.value.map((row) => row.name)).toEqual(["d"]);
    expect(view.pageText.value).toBe("4-4 of 4");
  });

  it("列の並び替え結果をページ分割前に適用する", () => {
    const view = useDataTableView(ref(rows), ref(2));

    view.toggleSort("score");
    expect(view.visibleItems.value.map((row) => row.name)).toEqual(["d", "b"]);

    view.toggleSort("score");
    expect(view.visibleItems.value.map((row) => row.name)).toEqual(["a", "b"]);
  });

  it("表示件数が-1の場合は全件を1ページで表示する", () => {
    const view = useDataTableView(ref(rows), ref(-1));

    expect(view.pageCount.value).toBe(1);
    expect(view.visibleItems.value).toHaveLength(4);
    expect(view.pageText.value).toBe("1-4 of 4");
  });

  it("表示件数を変えると先頭ページへ戻る", async () => {
    const itemsPerPage = ref(2);
    const view = useDataTableView(ref(rows), itemsPerPage);
    view.page.value = 2;

    itemsPerPage.value = 3;
    await nextTick();

    expect(view.page.value).toBe(1);
  });

  it("行がない場合は0件として表示する", () => {
    const view = useDataTableView(ref<Row[]>([]), ref(5));

    expect(view.visibleItems.value).toEqual([]);
    expect(view.pageText.value).toBe("0-0 of 0");
  });
});
