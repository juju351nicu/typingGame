<script setup lang="ts">
import { computed, ref, watch } from "vue";
import RankingSummaryPanel from "@/components/RankingSummaryPanel.vue";
import RankingTablePanel from "@/components/RankingTablePanel.vue";
import RankingTrendPanel from "@/components/RankingTrendPanel.vue";
import { useGameScoresStore } from "@/stores/gameScores";
import {
  getRankingRankClass,
  useRankingPageState,
} from "@/composables/useRankingPageState";
import Const from "@/constants/const";
import { fetchRankingsApi } from "@/services/scoreService";
import type { GameScore, RankingQuery } from "@/types/interfaces";

/** 保存済みスコアを管理するストア */
const gameScoresStore = useGameScoresStore();

void gameScoresStore.loadMyGameScoresIfAvailable();

/** 全体ランキングAPIから取得したスコア一覧 */
const allRankingScores = ref<GameScore[]>([]);

/** 全体ランキングAPI取得中か */
const isAllRankingLoading = ref(false);

/** バックエンドAPIが有効か */
const isBackendApiEnabled = Const.BACKEND_API.ENABLED;

const {
  activeTimeLimitSeconds,
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
  isAllRankingSelected,
  isTimeAttackSelected,
  itemsPerPage,
  modeOptions,
  normalBestScore,
  normalBestScoreSummary,
  pages,
  performanceTrendItems,
  rankingItems,
  scoreSourceOptions,
  selectedGameRule,
  selectedMode,
  selectedRankingTab,
  selectedScoreSource,
  selectedTimeLimitSeconds,
  selectedTrendMetric,
  timeAttackBestScore,
  timeAttackBestScoreSummary,
  timeAttackGameRule,
  timeLimitOptions,
  trendMetricOptions,
  trendTitle,
} = useRankingPageState(gameScoresStore, { allRankingScores });

/** ランキング画面の補足文 */
const rankingSubtitle = computed((): string => {
  if (isAllRankingSelected.value && isAllRankingLoading.value) {
    return "全体ランキングを読み込んでいます。";
  }
  if (isAllRankingSelected.value) {
    return "登録ユーザーを含む全体ランキングです。";
  }
  return "保存されたプレイ履歴です。";
});

/** 全体ランキングAPIの検索条件を作成する。 */
const createRankingQuery = (): RankingQuery => {
  return {
    mode: selectedMode.value,
    gameRule: selectedGameRule.value,
    timeLimitSeconds: activeTimeLimitSeconds.value,
    limit: 50,
  };
};

/**
 * 全体ランキングAPIからスコア一覧を取得する。
 *
 * API無効時や自分の記録を表示中の場合は取得しない。
 * 取得に失敗した場合は、直前に取得できた全体ランキング表示を維持する。
 */
const loadAllRankingScoresIfAvailable = async (): Promise<void> => {
  if (!isBackendApiEnabled || !isAllRankingSelected.value) {
    isAllRankingLoading.value = false;
    return;
  }

  isAllRankingLoading.value = true;
  try {
    allRankingScores.value = await fetchRankingsApi(createRankingQuery());
  } catch {
    // API取得に失敗しても画面表示中のランキングデータは維持する。
  } finally {
    isAllRankingLoading.value = false;
  }
};

watch(
  [selectedScoreSource, selectedMode, selectedGameRule, activeTimeLimitSeconds],
  () => {
    void loadAllRankingScoresIfAvailable();
  },
  { immediate: true }
);

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
        <p class="score-subtitle">{{ rankingSubtitle }}</p>
      </div>
      <v-btn-toggle
        v-if="isBackendApiEnabled"
        v-model="selectedScoreSource"
        mandatory
        density="comfortable"
        color="primary"
        class="score-source-toggle"
      >
        <v-btn
          v-for="option in scoreSourceOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.title }}
        </v-btn>
      </v-btn-toggle>
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

.score-source-toggle {
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  flex: 0 1 auto;
}

.score-source-toggle :deep(.v-btn) {
  min-width: 132px;
  text-transform: none;
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

  .score-source-toggle {
    width: 100%;
  }

  .score-source-toggle :deep(.v-btn) {
    flex: 1 1 0;
    min-width: 0;
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
