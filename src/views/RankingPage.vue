<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AppButtonToggle from "@/components/AppButtonToggle.vue";
import AppSelectField from "@/components/AppSelectField.vue";
import AppTabs from "@/components/AppTabs.vue";
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

/** ランキング画面のタブ */
const rankingTabs = [
  { label: "サマリー", value: "summary" },
  { label: "分析", value: "trend" },
  { label: "ランキング表", value: "table" },
];

/** ランク表示用CSSクラス */
const getRankClass = (rank: number): string => {
  return getRankingRankClass(rank);
};
</script>
<template>
  <div class="app-container score-board">
    <div class="score-header">
      <div>
        <p class="score-title">Ranking</p>
        <p class="score-subtitle">{{ rankingSubtitle }}</p>
      </div>
      <AppButtonToggle
        v-if="isBackendApiEnabled"
        v-model="selectedScoreSource"
        :items="scoreSourceOptions"
        aria-label="スコアの取得元"
        class="score-source-toggle"
      />
      <AppSelectField
        v-model="selectedMode"
        :items="modeOptions"
        label="難易度"
        class="ranking-filter"
      />
      <AppSelectField
        v-model="selectedGameRule"
        :items="gameRuleOptions"
        label="ルール"
        class="ranking-filter"
      />
      <AppSelectField
        v-if="isTimeAttackSelected"
        v-model="selectedTimeLimitSeconds"
        :items="timeLimitOptions"
        label="制限時間"
        class="ranking-filter"
      />
    </div>

    <section class="ranking-tabs-panel">
      <AppTabs
        v-model="selectedRankingTab"
        :items="rankingTabs"
        density="comfortable"
        :slider="false"
        class="ranking-tabs"
      />

      <div class="ranking-window">
        <div v-if="selectedRankingTab === 'summary'">
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
        </div>

        <div v-else-if="selectedRankingTab === 'trend'">
          <RankingTrendPanel
            v-model="selectedTrendMetric"
            :performance-trend-items="performanceTrendItems"
            :trend-metric-options="trendMetricOptions"
            :trend-title="trendTitle"
            :get-trend-value-label="getTrendValueLabel"
          />
        </div>

        <div v-else>
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
        </div>
      </div>
    </section>
  </div>
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

.score-source-toggle :deep(.app-btn-toggle__button) {
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
  height: 44px;
  margin-bottom: 14px;
  overflow: hidden;
  padding: 0 12px;
}

.ranking-tabs :deep(.app-tabs__tab) {
  font-size: 1.3rem;
  font-weight: bold;
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
    /* 縦並びでは flex-basis が高さとして効くため、内容の高さに戻します。 */
    flex: 0 0 auto;
    max-width: none;
  }

  .score-source-toggle {
    width: 100%;
  }

  .score-source-toggle :deep(.app-btn-toggle__button) {
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
}
</style>
