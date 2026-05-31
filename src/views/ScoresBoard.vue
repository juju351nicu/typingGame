<script setup lang="ts">
import { useGameScoresStore } from "@/stores/gameScores";
import { computed, ref } from "vue";
import Const from "@/constants/const";
import Util from "@/utils/util";
import { GameScore, RankingScore } from "@/types/interfaces";

//インポートした関数を呼び出してストアをインスタンス化して変数に代入
const gameScoresStore = useGameScoresStore();
/** data-tableの1ページあたりの表示件数（デフォルト）*/
const itemsPerPage = ref(Const.NUMBER_OF_ITEMS);
/** data-tableの表示件数の選択リスト */
const pages = Const.DATA_TABLE_PAGES;
/** テーブルの関連するラベル・プロパティ等の情報 */
const headers = [
  { title: "順位", align: "start", key: "rank" },
  { title: "スコア", align: "end", key: "score" },
  { title: "ランク", align: "center", key: "resultRank" },
  { title: "WPM", align: "end", key: "wpm" },
  { title: "正タイプ", align: "end", key: "correctCharacterCount" },
  { title: "正確率", align: "end", key: "accuracy" },
  { title: "ミス", align: "end", key: "missCount" },
  { title: "難易度", align: "start", key: "mode" },
  { title: "タイム", align: "start", key: "time" },
  { title: "日付", align: "end", key: "date" },
] as const;

/** 難易度フィルター */
const selectedMode = ref<number | null>(null);

/** 難易度フィルターの選択肢 */
const modeOptions = [{ title: "All", value: null }, ...Const.DIFFICULTY_LEVEL];

/** スコア一覧 */
const gameScores = computed((): GameScore[] => {
  return gameScoresStore.getGameScoreList;
});

/** ランキング用スコア一覧 */
const rankingItems = computed((): RankingScore[] => {
  return Util.createRankingScores(gameScores.value, selectedMode.value);
});

/** 最高スコア */
const bestScore = computed((): RankingScore | null => {
  return rankingItems.value[0] ?? null;
});

/** ランク表示用CSSクラス */
const getRankClass = (rank: number): string => {
  if (rank === 1) {
    return "rank-first";
  }
  if (rank === 2) {
    return "rank-second";
  }
  if (rank === 3) {
    return "rank-third";
  }
  return "rank-normal";
};
</script>
<template>
  <v-container class="score-board">
    <div class="score-header">
      <div>
        <p class="score-title">Ranking</p>
        <p class="score-subtitle">localStorage に保存されたプレイ履歴です。</p>
      </div>
      <v-select
        v-model="selectedMode"
        :items="modeOptions"
        item-title="title"
        item-value="value"
        label="難易度"
        variant="outlined"
        density="comfortable"
        hide-details
        class="mode-filter"
      />
    </div>

    <div class="summary-grid">
      <div class="summary-card best-score-card">
        <span class="summary-label">Best Score</span>
        <span class="summary-value">{{ bestScore?.score ?? "-" }}</span>
        <span class="summary-note">
          {{
            bestScore
              ? `${bestScore.resultRank}ランク / ${Util.getLevel(bestScore.mode)} / ${bestScore.time}`
              : "No records"
          }}
        </span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Plays</span>
        <span class="summary-value">{{ gameScores.length }}</span>
        <span class="summary-note">保存済みプレイ回数</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">Showing</span>
        <span class="summary-value">{{ rankingItems.length }}</span>
        <span class="summary-note">現在の表示件数</span>
      </div>
    </div>

    <v-data-table
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="rankingItems"
      :items-per-page-options="pages"
      items-per-page-text="表示行数"
      no-data-text="まだスコアがありません。ゲームをプレイするとここに表示されます。"
      class="ranking-table elevation-1"
    >
      <template v-slot:item.rank="{ value }">
        <span class="rank-badge" :class="getRankClass(value)">
          {{ value }}位
        </span>
      </template>
      <template v-slot:item.score="{ value }">
        <span class="score-cell">{{ value }}</span>
      </template>
      <template v-slot:item.resultRank="{ value }">
        <span
          class="result-rank-badge"
          :style="{ backgroundColor: Util.getResultRankColor(value) }"
        >
          {{ value }}
        </span>
      </template>
      <template v-slot:item.wpm="{ value }">
        <span class="metric-cell">{{ value ?? "-" }}</span>
      </template>
      <template v-slot:item.correctCharacterCount="{ value }">
        <span class="metric-cell">{{ value ?? "-" }}</span>
      </template>
      <template v-slot:item.accuracy="{ value }">
        <span class="metric-cell">{{ value != null ? `${value}%` : "-" }}</span>
      </template>
      <template v-slot:item.missCount="{ value }">
        <span class="metric-cell">{{ value ?? "-" }}</span>
      </template>
      <template v-slot:item.mode="{ value }">
        <v-chip :color="Util.getColor(value)">
          {{ Util.getLevel(value) }}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>
<style scoped>
.score-board {
  max-width: 1080px;
}

.score-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.score-title {
  color: #222222;
  font-size: 3.2rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.score-subtitle {
  color: #666666;
  font-size: 1.4rem;
  margin: 8px 0 0;
}

.mode-filter {
  max-width: 220px;
}

.summary-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 24px;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 18px 20px;
}

.best-score-card {
  border-top: 4px solid #673ab7;
}

.summary-label {
  color: #666666;
  display: block;
  font-size: 1.3rem;
  margin-bottom: 6px;
}

.summary-value {
  color: #222222;
  display: block;
  font-size: 3.2rem;
  font-weight: bold;
  line-height: 1.1;
}

.summary-note {
  color: #666666;
  display: block;
  font-size: 1.3rem;
  margin-top: 8px;
}

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
  color: #333333;
  font-weight: bold;
}

@media (max-width: 720px) {
  .score-board {
    padding-left: 12px;
    padding-right: 12px;
  }

  .score-header {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;
  }

  .score-title {
    font-size: 2.6rem;
  }

  .score-subtitle {
    font-size: 1.2rem;
  }

  .mode-filter {
    max-width: none;
  }

  .summary-grid {
    gap: 10px;
    grid-template-columns: 1fr;
    margin-bottom: 18px;
  }

  .summary-card {
    padding: 14px 16px;
  }

  .summary-value {
    font-size: 2.6rem;
  }

  .ranking-table :deep(table) {
    min-width: 760px;
  }
}
</style>
