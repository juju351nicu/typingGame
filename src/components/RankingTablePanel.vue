<script setup lang="ts">
import type { GameMode, GameRule, RankingScore } from "@/types/interfaces";
import { computed } from "vue";
import type { DataTableHeader } from "vuetify";

type ItemsPerPageOption = number | { title: string; value: number };

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
}

const props = defineProps<RankingTablePanelProps>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const itemsPerPage = computed({
  get: (): number => props.modelValue,
  set: (value: number) => emit("update:modelValue", value),
});
</script>
<template>
  <v-data-table
    v-model:items-per-page="itemsPerPage"
    :headers="headers"
    :items="rankingItems"
    :items-per-page-options="pages"
    items-per-page-text="表示行数"
    no-data-text="まだスコアがありません。ゲームをプレイするとここに表示されます。"
    class="ranking-table elevation-1"
  >
    <template #item.rank="{ value }">
      <span class="rank-badge" :class="getRankClass(value)">
        {{ value }}位
      </span>
    </template>
    <template #item.score="{ value }">
      <span class="score-cell">{{ value }}</span>
    </template>
    <template #item.resultRank="{ value }">
      <span
        class="result-rank-badge"
        :style="{ backgroundColor: getResultRankColor(value) }"
      >
        {{ value }}
      </span>
    </template>
    <template #item.wpm="{ value }">
      <span class="metric-cell">{{ formatNullableMetric(value) }}</span>
    </template>
    <template #item.correctCharacterCount="{ value }">
      <span class="metric-cell">{{ formatNullableMetric(value) }}</span>
    </template>
    <template #item.accuracy="{ value }">
      <span class="metric-cell">
        {{ formatAccuracyMetric(value) }}
      </span>
    </template>
    <template #item.missCount="{ value }">
      <span class="metric-cell">{{ formatNullableMetric(value) }}</span>
    </template>
    <template #item.mode="{ value }">
      <v-chip :color="getModeColor(value)">
        {{ getModeLabel(value) }}
      </v-chip>
    </template>
    <template #item.gameRule="{ item }">
      <v-chip
        :color="
          getScoreGameRule(item) === timeAttackGameRule ? 'deep-purple' : 'grey'
        "
        variant="tonal"
      >
        {{ getScoreGameRuleLabel(item) }}
      </v-chip>
    </template>
    <template #item.timeLimitSeconds="{ item }">
      <span class="metric-cell">{{ getTimeLimitLabel(item) }}</span>
    </template>
  </v-data-table>
</template>
<style scoped>
.ranking-table {
  border-radius: 8px;
  overflow: hidden;
}

.ranking-table :deep(.v-table__wrapper) {
  overflow-x: auto;
}

.ranking-table :deep(th),
.ranking-table :deep(td) {
  white-space: nowrap;
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

@media (max-width: 720px) {
  .ranking-table :deep(table) {
    min-width: 760px;
  }
}
</style>
