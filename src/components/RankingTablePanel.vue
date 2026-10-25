<script setup lang="ts">
import type {
  DataTableHeader,
  GameMode,
  GameRule,
  RankingScore,
} from "@/types/interfaces";
import { computed, toRef } from "vue";
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import AppSelectField from "@/components/AppSelectField.vue";
import {
  createPageText,
  useDataTableView,
} from "@/composables/useDataTableView";

type ItemsPerPageOption = number | { title: string; value: number };

/** サーバーサイドページング時のページ情報 */
interface ServerPaging {
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
}

interface RankingTablePanelProps {
  modelValue: number;
  headers: readonly DataTableHeader[];
  rankingItems: RankingScore[];
  pages: readonly ItemsPerPageOption[];
  timeAttackGameRule: GameRule;
  formatAccuracyMetric: (value: number | null | undefined) => string;
  formatNullableMetric: (value: number | string | null | undefined) => string;
  getModeColor: (mode: GameMode) => string;
  getModeLabel: (mode: GameMode) => string;
  getRankClass: (rank: number) => string;
  getResultRankColor: (rank: string) => string;
  getScoreGameRule: (score: RankingScore) => GameRule;
  getScoreGameRuleLabel: (score: RankingScore) => string;
  getTimeLimitLabel: (score: RankingScore) => string;
  /**
   * サーバーサイドページング時のページ情報。
   * 指定した場合、rankingItemsは表示中のページの行として扱い、画面内では並び替え・ページ分割しない。
   */
  serverPaging?: ServerPaging | null;
}

const props = withDefaults(defineProps<RankingTablePanelProps>(), {
  serverPaging: null,
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
  "update:page": [value: number];
}>();

const itemsPerPage = computed({
  get: (): number => props.modelValue,
  set: (value: number) => emit("update:modelValue", value),
});

/** 表示件数の選択肢 */
const itemsPerPageOptions = computed(() => {
  return props.pages.map((option) =>
    typeof option === "number"
      ? { title: String(option), value: option }
      : option
  );
});

const { page, sortBy, visibleItems, pageCount, pageText, toggleSort } =
  useDataTableView(toRef(props, "rankingItems"), itemsPerPage);

/** サーバー側でページ分割しているか */
const isServerPaging = computed((): boolean => props.serverPaging != null);

/** 表に表示する行 */
const displayItems = computed((): RankingScore[] => {
  return props.serverPaging ? props.rankingItems : visibleItems.value;
});

/** 現在のページ番号 */
const currentPage = computed((): number => {
  return props.serverPaging?.page ?? page.value;
});

/** 最後のページ番号 */
const lastPage = computed((): number => {
  return props.serverPaging?.totalPages ?? pageCount.value;
});

/** 「1-5 of 12」形式の表示範囲 */
const displayPageText = computed((): string => {
  const serverPaging = props.serverPaging;
  if (!serverPaging) {
    return pageText.value;
  }
  return createPageText(
    serverPaging.page,
    serverPaging.size,
    serverPaging.totalCount
  );
});

/**
 * 指定ページへ移動する。
 *
 * サーバーサイドページング時は親へページ番号を渡し、APIで取得し直してもらう。
 *
 * @param nextPage 移動先のページ番号
 */
const goToPage = (nextPage: number): void => {
  if (isServerPaging.value) {
    emit("update:page", nextPage);
    return;
  }
  page.value = nextPage;
};

/** 数値として表示する指標の列 */
const NUMERIC_METRIC_KEYS = ["wpm", "correctCharacterCount", "missCount"];

/**
 * 列見出しに付けるaria-sort属性値を取得する。
 *
 * @param key 列のキー
 * @returns 並び替え中の列は昇順・降順、それ以外は none
 */
const getAriaSort = (key: string): "ascending" | "descending" | "none" => {
  if (sortBy.value?.key !== key) {
    return "none";
  }
  return sortBy.value.order === "asc" ? "ascending" : "descending";
};

/**
 * 行データから列の値を取得する。
 *
 * @param item 表示する行
 * @param key 列のキー
 * @returns 列の値
 */
const getCellValue = (
  item: RankingScore,
  key: string
): number | string | null | undefined => {
  return (item as unknown as Record<string, number | string | null>)[key];
};

/**
 * ゲームルール列のチップ色を取得する。
 *
 * @param item 表示する行
 * @returns タイムアタックは紫、通常はグレー
 */
const getGameRuleChipColor = (item: RankingScore): string => {
  return props.getScoreGameRule(item) === props.timeAttackGameRule
    ? "#673ab7"
    : "#9e9e9e";
};
</script>
<template>
  <div class="ranking-table">
    <div class="ranking-table__wrapper">
      <table>
        <thead>
          <tr>
            <th
              v-for="header in headers"
              :key="header.key"
              :class="`ranking-table__cell--${header.align ?? 'start'}`"
              :aria-sort="getAriaSort(header.key)"
            >
              <span v-if="isServerPaging">{{ header.title }}</span>
              <button
                v-else
                type="button"
                class="ranking-table__sort"
                :class="{
                  'ranking-table__sort--active': sortBy?.key === header.key,
                }"
                @click="toggleSort(header.key)"
              >
                <span>{{ header.title }}</span>
                <UIcon
                  :name="
                    sortBy?.key === header.key && sortBy.order === 'desc'
                      ? 'i-lucide-arrow-down'
                      : 'i-lucide-arrow-up'
                  "
                  class="ranking-table__sort-icon"
                  aria-hidden="true"
                />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="displayItems.length === 0">
            <td :colspan="headers.length" class="ranking-table__no-data">
              まだスコアがありません。ゲームをプレイするとここに表示されます。
            </td>
          </tr>
          <tr
            v-for="(item, index) in displayItems"
            :key="`${item.date}-${item.score}-${index}`"
          >
            <td
              v-for="header in headers"
              :key="header.key"
              :class="`ranking-table__cell--${header.align ?? 'start'}`"
            >
              <span
                v-if="header.key === 'rank'"
                class="rank-badge"
                :class="getRankClass(item.rank)"
              >
                {{ item.rank }}位
              </span>
              <span v-else-if="header.key === 'score'" class="score-cell">{{
                item.score
              }}</span>
              <span
                v-else-if="header.key === 'resultRank'"
                class="result-rank-badge"
                :style="{
                  backgroundColor: getResultRankColor(item.resultRank),
                }"
              >
                {{ item.resultRank }}
              </span>
              <span
                v-else-if="NUMERIC_METRIC_KEYS.includes(header.key)"
                class="metric-cell"
                >{{
                  formatNullableMetric(getCellValue(item, header.key))
                }}</span
              >
              <span v-else-if="header.key === 'accuracy'" class="metric-cell">
                {{ formatAccuracyMetric(item.accuracy) }}
              </span>
              <span
                v-else-if="header.key === 'mode'"
                class="table-chip"
                :style="{ color: getModeColor(item.mode) }"
              >
                {{ getModeLabel(item.mode) }}
              </span>
              <span
                v-else-if="header.key === 'gameRule'"
                class="table-chip"
                :style="{ color: getGameRuleChipColor(item) }"
              >
                {{ getScoreGameRuleLabel(item) }}
              </span>
              <span
                v-else-if="header.key === 'timeLimitSeconds'"
                class="metric-cell"
                >{{ getTimeLimitLabel(item) }}</span
              >
              <template v-else>{{ getCellValue(item, header.key) }}</template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="ranking-table__footer">
      <div class="ranking-table__items-per-page">
        <span>表示行数</span>
        <AppSelectField
          v-model="itemsPerPage"
          :items="itemsPerPageOptions"
          density="compact"
          aria-label="表示行数"
          class="ranking-table__items-select"
        />
      </div>
      <div class="ranking-table__info">{{ displayPageText }}</div>
      <nav
        class="ranking-table__pagination"
        aria-label="ランキング表のページ送り"
      >
        <UButton
          class="ranking-table__page-button"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-first"
          aria-label="最初のページ"
          :disabled="currentPage <= 1"
          @click="goToPage(1)"
        />
        <UButton
          class="ranking-table__page-button"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-left"
          aria-label="前のページ"
          :disabled="currentPage <= 1"
          @click="goToPage(currentPage - 1)"
        />
        <UButton
          class="ranking-table__page-button"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-right"
          aria-label="次のページ"
          :disabled="currentPage >= lastPage"
          @click="goToPage(currentPage + 1)"
        />
        <UButton
          class="ranking-table__page-button"
          color="neutral"
          variant="ghost"
          icon="i-lucide-chevron-last"
          aria-label="最後のページ"
          :disabled="currentPage >= lastPage"
          @click="goToPage(lastPage)"
        />
      </nav>
    </div>
  </div>
</template>
<style scoped>
/* Material Designのデータテーブルと同じ見た目にそろえる。 */
.ranking-table {
  --ranking-table-border: rgba(0, 0, 0, 0.12);
  background: var(--app-card-bg);
  border-radius: 8px;
  box-shadow:
    0 2px 1px -1px rgba(0, 0, 0, 0.2),
    0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  color: var(--app-card-text);
  font-size: 0.875rem;
  overflow: hidden;
}

:root.dark .ranking-table {
  --ranking-table-border: rgba(255, 255, 255, 0.12);
}

.ranking-table__wrapper {
  overflow-x: auto;
  width: 100%;
}

.ranking-table table {
  border-spacing: 0;
  width: 100%;
}

.ranking-table th,
.ranking-table td {
  border-bottom: thin solid var(--ranking-table-border);
  padding: 0 16px;
  white-space: nowrap;
}

.ranking-table th {
  font-weight: 500;
  height: 56px;
  text-align: start;
  user-select: none;
}

.ranking-table td {
  height: 52px;
}

.ranking-table tbody tr:last-child td {
  border-bottom: 0;
}

.ranking-table th.ranking-table__cell--center,
.ranking-table td.ranking-table__cell--center {
  text-align: center;
}

.ranking-table th.ranking-table__cell--end,
.ranking-table td.ranking-table__cell--end {
  text-align: end;
}

.ranking-table__sort {
  align-items: center;
  color: inherit;
  display: inline-flex;
  font-weight: inherit;
  gap: 4px;
}

.ranking-table__cell--end .ranking-table__sort {
  flex-direction: row-reverse;
}

.ranking-table__sort-icon {
  height: 18px;
  opacity: 0;
  transition: opacity 0.15s ease;
  width: 18px;
}

.ranking-table__sort:hover .ranking-table__sort-icon,
.ranking-table__sort:focus-visible .ranking-table__sort-icon {
  opacity: 0.5;
}

.ranking-table__sort--active .ranking-table__sort-icon {
  opacity: 1;
}

.ranking-table__no-data {
  text-align: center;
}

.rank-badge {
  border-radius: 999px;
  display: inline-block;
  font-size: 1.4rem;
  font-weight: bold;
  min-width: 52px;
  padding: 4px 10px;
  text-align: center;
}

.rank-first {
  background: #fff3bf;
  color: #8a5a00;
}

.rank-second {
  background: #e9ecef;
  color: #495057;
}

.rank-third {
  background: #ffe8cc;
  color: #9c4f00;
}

.rank-normal {
  background: #edf2ff;
  color: #364fc7;
}

.score-cell {
  font-size: 1.8rem;
  font-weight: bold;
}

.result-rank-badge {
  align-items: center;
  border-radius: 50%;
  color: #ffffff;
  display: inline-flex;
  font-size: 1.2rem;
  font-weight: bold;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.metric-cell {
  color: var(--app-text);
  font-weight: bold;
}

/* Material Designのtonalチップと同じく、文字色の12%を背景にする。 */
.table-chip {
  align-items: center;
  border-radius: 9999px;
  display: inline-flex;
  font-size: 0.875rem;
  height: 32px;
  padding: 0 12px;
  position: relative;
}

.table-chip::before {
  background: currentColor;
  border-radius: inherit;
  content: "";
  inset: 0;
  opacity: 0.12;
  position: absolute;
}

.ranking-table__footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding: 8px 4px;
}

.ranking-table__items-per-page {
  align-items: center;
  display: flex;
  justify-content: center;
}

.ranking-table__items-per-page > span {
  padding-inline-end: 8px;
}

.ranking-table__items-select {
  flex: 0 0 90px;
  width: 90px;
}

.ranking-table__info {
  display: flex;
  justify-content: flex-end;
  min-width: 116px;
  padding: 0 16px;
}

.ranking-table__pagination {
  align-items: center;
  display: flex;
  margin-inline-start: 16px;
}

.ranking-table__page-button {
  border-radius: 50%;
  height: 36px;
  justify-content: center;
  margin: 0.3rem;
  min-width: 0;
  opacity: 0.62;
  padding: 0;
  width: 36px;
}

.ranking-table__page-button:hover {
  background: transparent;
  opacity: 1;
}

.ranking-table__page-button:disabled {
  opacity: 0.26;
}

.ranking-table__page-button :deep(svg) {
  height: 24px;
  margin: 0;
  width: 24px;
}

@media (max-width: 720px) {
  .ranking-table table {
    min-width: 760px;
  }
}
</style>
