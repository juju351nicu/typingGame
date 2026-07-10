<script setup lang="ts">
import RankingSummaryPanel from "@/components/RankingSummaryPanel.vue";
import RankingTablePanel from "@/components/RankingTablePanel.vue";
import RankingTrendPanel from "@/components/RankingTrendPanel.vue";
import { useGameScoresStore } from "@/stores/gameScores";
import {
  getRankingRankClass,
  useRankingPageState,
} from "@/composables/useRankingPageState";

/** 保存済みスコアを管理するストア */
const gameScoresStore = useGameScoresStore();

void gameScoresStore.loadMyGameScoresIfAvailable();

const {
  bestScore,
  bestScoreSummary,
  formatAccuracyMetric,
  formatNullableMetric,
  gameRuleOptions,
  gameScores,
  getModeColor,
  getModeLabel,
  getResultRankColor,
  getScoreGameRule,
  getScoreGameRuleLabel,
  getTimeLimitLabel,
  getTrendValueLabel,
  headers,
  isTimeAttackSelected,
  itemsPerPage,
  modeOptions,
  normalBestScore,
  normalBestScoreSummary,
  pages,
  performanceTrendItems,
  rankingItems,
  selectedGameRule,
  selectedMode,
  selectedRankingTab,
  selectedTimeLimitSeconds,
  selectedTrendMetric,
  timeAttackBestScore,
  timeAttackBestScoreSummary,
  timeAttackGameRule,
  timeLimitOptions,
  trendMetricOptions,
  trendTitle,
} = useRankingPageState(gameScoresStore);

/** ランク表示用CSSクラス */
const getRankClass = (rank: number): string => {
  return getRankingRankClass(rank);
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
        class="ranking-filter"
      />
      <v-select
        v-model="selectedGameRule"
        :items="gameRuleOptions"
        item-title="title"
        item-value="value"
        label="ルール"
        variant="outlined"
        density="comfortable"
        hide-details
        class="ranking-filter"
      />
      <v-select
        v-if="isTimeAttackSelected"
        v-model="selectedTimeLimitSeconds"
        :items="timeLimitOptions"
        item-title="title"
        item-value="value"
        label="制限時間"
        variant="outlined"
        density="comfortable"
        hide-details
        class="ranking-filter"
      />
    </div>

    <section class="ranking-tabs-panel">
      <v-tabs
        v-model="selectedRankingTab"
        align-tabs="start"
        class="ranking-tabs"
        color="primary"
        density="comfortable"
      >
        <v-tab value="summary">サマリー</v-tab>
        <v-tab value="trend">分析</v-tab>
        <v-tab value="table">ランキング表</v-tab>
      </v-tabs>

      <v-window v-model="selectedRankingTab" class="ranking-window">
        <v-window-item value="summary">
          <RankingSummaryPanel
            :best-score="bestScore"
            :best-score-summary="bestScoreSummary"
            :normal-best-score="normalBestScore"
            :normal-best-score-summary="normalBestScoreSummary"
            :time-attack-best-score="timeAttackBestScore"
            :time-attack-best-score-summary="timeAttackBestScoreSummary"
            :game-scores-count="gameScores.length"
            :ranking-items-count="rankingItems.length"
          />
        </v-window-item>

        <v-window-item value="trend">
          <RankingTrendPanel
            v-model="selectedTrendMetric"
            :performance-trend-items="performanceTrendItems"
            :trend-metric-options="trendMetricOptions"
            :trend-title="trendTitle"
            :get-trend-value-label="getTrendValueLabel"
          />
        </v-window-item>

        <v-window-item value="table">
          <RankingTablePanel
            v-model="itemsPerPage"
            :headers="headers"
            :ranking-items="rankingItems"
            :pages="pages"
            :time-attack-game-rule="timeAttackGameRule"
            :format-accuracy-metric="formatAccuracyMetric"
            :format-nullable-metric="formatNullableMetric"
            :get-mode-color="getModeColor"
            :get-mode-label="getModeLabel"
            :get-rank-class="getRankClass"
            :get-result-rank-color="getResultRankColor"
            :get-score-game-rule="getScoreGameRule"
            :get-score-game-rule-label="getScoreGameRuleLabel"
            :get-time-limit-label="getTimeLimitLabel"
          />
        </v-window-item>
      </v-window>
    </section>
  </v-container>
</template>
<style scoped>
.score-board {
  max-width: 1080px;
}

.score-header {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.score-title {
  color: var(--app-text);
  font-size: 3.2rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}

.score-subtitle {
  color: var(--app-text-muted);
  font-size: 1.4rem;
  margin: 8px 0 0;
}

.ranking-filter {
  flex: 1 1 180px;
  max-width: 220px;
}

.ranking-tabs-panel {
  margin-bottom: 24px;
}

.ranking-tabs {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
  margin-bottom: 14px;
  padding: 0 12px;
}

.ranking-tabs :deep(.v-tab) {
  font-size: 1.3rem;
  font-weight: bold;
  min-width: 112px;
  text-transform: none;
}

.ranking-window {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-radius: 8px;
  box-shadow: var(--app-shadow);
  padding: 22px;
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

  .ranking-filter {
    max-width: none;
  }

  .ranking-window {
    padding: 16px;
  }

  .ranking-tabs {
    overflow-x: auto;
    padding: 0 8px;
  }

  .ranking-tabs :deep(.v-tab) {
    min-width: 104px;
  }

}
</style>
