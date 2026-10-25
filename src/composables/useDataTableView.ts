import { computed, ref, watch, type Ref } from "vue";

/** 並び順 */
export type SortOrder = "asc" | "desc";

/** 並び替えの状態 */
export interface DataTableSort {
  key: string;
  order: SortOrder;
}

/** useDataTableView の戻り値 */
export interface DataTableView<T> {
  /** 現在のページ番号（1始まり） */
  page: Ref<number>;
  /** 並び替えの状態。未指定の場合はnull */
  sortBy: Ref<DataTableSort | null>;
  /** 並び替え・ページ分割後の表示行 */
  visibleItems: Readonly<Ref<T[]>>;
  /** 総ページ数 */
  pageCount: Readonly<Ref<number>>;
  /** 「1-5 of 12」形式の表示範囲 */
  pageText: Readonly<Ref<string>>;
  /** 列見出しのクリックで並び順を切り替える */
  toggleSort: (key: string) => void;
}

/**
 * 表の値を比較する。
 *
 * 数値は大小で、それ以外は文字列として比較する。
 * null / undefined は常に末尾へ寄せる。
 *
 * @param left 比較する値
 * @param right 比較する値
 * @returns 並び替え用の比較結果
 */
export const compareTableValues = (left: unknown, right: unknown): number => {
  const isLeftEmpty = left === null || left === undefined;
  const isRightEmpty = right === null || right === undefined;
  if (isLeftEmpty || isRightEmpty) {
    return Number(isLeftEmpty) - Number(isRightEmpty);
  }
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }
  return String(left).localeCompare(String(right), "ja", { numeric: true });
};

/**
 * 並び順を「昇順 → 降順 → 解除」の順で切り替える。
 *
 * @param current 現在の並び替え状態
 * @param key クリックされた列のキー
 * @returns 次の並び替え状態
 */
export const getNextSort = (
  current: DataTableSort | null,
  key: string
): DataTableSort | null => {
  if (!current || current.key !== key) {
    return { key, order: "asc" };
  }
  if (current.order === "asc") {
    return { key, order: "desc" };
  }
  return null;
};

/**
 * 「1-5 of 12」形式の表示範囲を作成する。
 *
 * @param page 現在のページ番号（1始まり）
 * @param itemsPerPage 1ページあたりの行数。0以下の場合は全件表示
 * @param total 総件数
 * @returns 表示範囲の文言
 */
export const createPageText = (
  page: number,
  itemsPerPage: number,
  total: number
): string => {
  if (total === 0) {
    return "0-0 of 0";
  }
  if (itemsPerPage <= 0) {
    return `1-${total} of ${total}`;
  }
  const start = (page - 1) * itemsPerPage + 1;
  const end = Math.min(page * itemsPerPage, total);
  return `${start}-${end} of ${total}`;
};

/**
 * 表の並び替えとページ分割を管理する。
 *
 * データテーブルの並び替え・ページ送りの挙動を、
 * 表示部品から切り離して扱えるようにする。
 *
 * @param items 表示する行
 * @param itemsPerPage 1ページあたりの行数。-1の場合は全件表示
 * @returns 表示用の状態と操作
 */
export const useDataTableView = <T extends object>(
  items: Readonly<Ref<T[]>>,
  itemsPerPage: Readonly<Ref<number>>
): DataTableView<T> => {
  const page = ref(1);
  const sortBy = ref<DataTableSort | null>(null);

  const sortedItems = computed((): T[] => {
    const sort = sortBy.value;
    if (!sort) {
      return items.value;
    }
    const direction = sort.order === "asc" ? 1 : -1;
    return [...items.value].sort((left, right) => {
      const leftValue = (left as Record<string, unknown>)[sort.key];
      const rightValue = (right as Record<string, unknown>)[sort.key];
      const isLeftEmpty = leftValue === null || leftValue === undefined;
      const isRightEmpty = rightValue === null || rightValue === undefined;
      // 空値は降順でも末尾に置き、値のある行を先に並べる。
      if (isLeftEmpty || isRightEmpty) {
        return compareTableValues(leftValue, rightValue);
      }
      return compareTableValues(leftValue, rightValue) * direction;
    });
  });

  const pageCount = computed((): number => {
    if (itemsPerPage.value <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(items.value.length / itemsPerPage.value));
  });

  const visibleItems = computed((): T[] => {
    if (itemsPerPage.value <= 0) {
      return sortedItems.value;
    }
    const start = (page.value - 1) * itemsPerPage.value;
    return sortedItems.value.slice(start, start + itemsPerPage.value);
  });

  const pageText = computed((): string => {
    return createPageText(page.value, itemsPerPage.value, items.value.length);
  });

  const toggleSort = (key: string): void => {
    sortBy.value = getNextSort(sortBy.value, key);
  };

  // 表示件数やデータが変わったときは、存在しないページに残らないよう先頭へ戻す。
  watch([itemsPerPage, () => items.value.length], () => {
    page.value = 1;
  });

  return {
    page,
    sortBy,
    visibleItems,
    pageCount,
    pageText,
    toggleSort,
  };
};
